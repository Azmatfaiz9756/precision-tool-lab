import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { apiClient } from "@/api/apiClient";
import { formatPrice } from "@/lib/constants";
import { handleProductImageError, useSettings } from "@/lib/utils";
import { toast } from "sonner";
import {
  MessageCircle,
  Bot,
  Send,
  X,
  Phone,
  MapPin,
  Clock,
  Search,
  ShoppingBag,
  Loader2,
  ChevronRight,
  ArrowRight,
  Sparkles,
  RefreshCw
} from "lucide-react";

const QUICK_PROMPTS = [
  { label: "🔍 Search Products", text: "Help me find a product" },
  { label: "🕒 Store Hours & Location", text: "Where is the store and when is it open?" },
  { label: "🚚 Shipping Policy", text: "Tell me about shipping and delivery rates" },
  { label: "📦 Returns & Refunds", text: "What is your return and refund policy?" },
  { label: "🧾 Track My Order", text: "Track my order status" }
];

export default function AIChatbot() {
  const settings = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: `Hi! I am the ${settings.store_name || "TST"} Assistant. I can help you search for products, check stock, track your orders, or answer questions about store hours, location, and policies. What can I help you with today?`,
      type: "text"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [productsDb, setProductsDb] = useState([]);
  const [loadingDb, setLoadingDb] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Lazy load products database when chatbot opens
  useEffect(() => {
    if (isOpen && productsDb.length === 0 && !loadingDb) {
      setLoadingDb(true);
      import("@/api/products.json")
        .then((data) => {
          setProductsDb(data.default || data);
          setLoadingDb(false);
        })
        .catch((err) => {
          console.error("Failed to load products database", err);
          setLoadingDb(false);
        });
    }
  }, [isOpen, productsDb.length, loadingDb]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMsgId = Date.now();
    setMessages((prev) => [...prev, { id: userMsgId, sender: "user", text, type: "text" }]);
    setInputText("");
    setIsTyping(true);

    // Simulate thinking delay
    setTimeout(async () => {
      const botResponse = await generateBotResponse(text);
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: "bot", ...botResponse }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickPromptClick = (text) => {
    handleSendMessage(text);
  };

  const addToCart = async (product) => {
    try {
      await apiClient.entities.CartItem.create({
        product_id: product.id,
        product_name: product.name,
        product_image: product.images?.[0] || "",
        price: product.price,
        quantity: 1,
      });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success(`${product.name.substring(0, 25)}... added to cart!`);
    } catch (e) {
      toast.error("Failed to add product to cart");
    }
  };

  // Bot response using Gemini AI Backend
  const generateBotResponse = async (input) => {
    const query = input.toLowerCase().trim();

    // Preserve Order Tracking Logic locally
    if (
      query.includes("track") ||
      query.includes("order") ||
      query.includes("status") ||
      query.includes("history") ||
      query.includes("purchase") ||
      query.includes("my order")
    ) {
      const orderMatch = query.match(/\b#?(\d{4,6})\b/);
      if (orderMatch) {
        return await lookupOrder(orderMatch[1]);
      }

      if (isAuthenticated) {
        try {
          const orders = await apiClient.entities.Order.list("-created_date", 5);
          if (orders && orders.length > 0) {
            return {
              type: "orders",
              text: `I found ${orders.length} recent order(s) associated with your account:`,
              data: orders
            };
          } else {
            return {
              type: "text",
              text: "You haven't placed any orders yet. Once you make a purchase, your order history will appear here!"
            };
          }
        } catch (e) {
          return {
            type: "text",
            text: "Failed to fetch your orders. Please log in again or search using your specific Order ID (e.g. 'track 1002')."
          };
        }
      } else {
        return {
          type: "text",
          text: `🔑 **Order Tracking**\n\nTo view your order history and live tracking, please [Log In to your Account](/login).\n\nAlternatively, if you know your Order ID (e.g. #1002), type it here (e.g. 'track 1002') and I'll lookup the status for you!`
        };
      }
    }

    // Check if input is a direct order lookup (e.g., "#1002" or just "1002")
    const standaloneOrderMatch = query.match(/^\s*#?(\d{4,6})\s*$/);
    if (standaloneOrderMatch) {
      return await lookupOrder(standaloneOrderMatch[1]);
    }

    // Call Gemini Backend API for all other intents
    try {
      const res = await apiClient.chat.send(input);
      return {
        type: "text",
        text: res.text
      };
    } catch (e) {
      console.error(e);
      return {
        type: "text",
        text: e.message || "Oops, I'm having trouble connecting to my AI brain right now. Please try again later!"
      };
    }
  };

  // Order lookup logic
  const lookupOrder = async (orderIdNum) => {
    try {
      const orderNumber = `#${orderIdNum}`;
      const orders = await apiClient.entities.Order.filter({ order_number: orderNumber });
      const order = orders?.[0];

      if (order) {
        return {
          type: "order-status",
          text: `Here is the status for Order **${order.order_number}**:`,
          data: order
        };
      } else {
        return {
          type: "text",
          text: `I couldn't find an order matching **${orderNumber}**. Please verify your order number or log in to view your account details.`
        };
      }
    } catch (e) {
      return {
        type: "text",
        text: "Error looking up order. Please check the ID or try again later."
      };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "confirmed":
      case "processing": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "shipped":
      case "out_for_delivery": return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      case "delivered": return "text-green-400 bg-green-500/10 border-green-500/20";
      case "cancelled": return "text-red-400 bg-red-500/10 border-red-500/20";
      default: return "text-muted-foreground bg-secondary border-border";
    }
  };

  return (
    <>
      {/* WhatsApp Floating Button */}
      <a
        href={`https://wa.me/${settings.whatsapp.replace(/\+/g, "")}?text=Hi, I have a question about ${settings.store_name}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-[88px] z-40 h-12 w-12 flex items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl hover:bg-[#20ba5a] transition-all duration-300 hover:scale-110 group"
        title="Chat on WhatsApp"
        id="whatsapp-float-btn"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute right-14 bg-[#111] border border-white/10 text-white text-[11px] font-medium tracking-wide py-1 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-md">
          Chat on WhatsApp
        </span>
      </a>

      {/* AI Chatbot Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 h-12 w-12 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl hover:bg-primary/95 transition-all duration-300 hover:scale-110 group overflow-visible"
        title={`${settings.store_name} AI Assistant`}
        id="ai-chatbot-toggle-btn"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6 animate-pulse" />}
        {!isOpen && (
          <span className="absolute top-0 right-0 h-3.5 w-3.5 bg-sky-500 rounded-full border-2 border-background animate-bounce" />
        )}
        <span className="absolute right-14 bg-[#111] border border-white/10 text-white text-[11px] font-medium tracking-wide py-1 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-md">
          {settings.store_name} AI Assistant
        </span>
      </button>

      {/* Chat Window Popup */}
      {isOpen && (
        <div
          className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 w-full sm:w-[380px] h-[100dvh] sm:h-[550px] border-0 sm:border border-white/10 bg-[#0e1320] sm:bg-[#0e1320]/95 backdrop-blur-lg shadow-2xl rounded-none sm:rounded-2xl flex flex-col overflow-hidden z-[100] transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
          id="ai-chatbot-window"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/20 via-primary/5 to-secondary/30 border-b border-white/5 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Bot className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-wide text-white flex items-center gap-1.5">
                  {settings.store_name || "TST"} Assistant
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                </h3>
                <p className="text-[10px] text-muted-foreground">Online & Ready</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col min-h-0 bg-[#07090f]/30">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === "user" ? "align-self-end items-end self-end" : "align-self-start items-start self-start"
                }`}
              >
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm whitespace-pre-wrap ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-[#161b2c] text-white border border-white/5 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>

                {/* Rich Product Catalog Render */}
                {msg.type === "products" && msg.data && (
                  <div className="mt-2.5 space-y-2 w-full max-w-[320px] self-start animate-in fade-in duration-300">
                    {msg.data.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-[#1b2138] border border-white/5 rounded-xl p-2.5 flex gap-2.5 hover:border-primary/40 transition-colors"
                      >
                        <Link
                          to={`/product/${prod.id}`}
                          onClick={() => setIsOpen(false)}
                          className="w-14 h-14 bg-[#0d1117] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                        >
                          <img
                            src={prod.images?.[0] || ""}
                            alt=""
                            className="w-full h-full object-cover p-0.5"
                            onError={handleProductImageError}
                          />
                        </Link>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <span className="text-[9px] uppercase font-mono text-primary font-bold tracking-wider">{prod.brand}</span>
                            <Link
                              to={`/product/${prod.id}`}
                              onClick={() => setIsOpen(false)}
                              className="text-[12px] text-white font-semibold line-clamp-1 hover:text-primary leading-tight mt-0.5 block"
                            >
                              {prod.name}
                            </Link>
                          </div>
                          <div className="flex items-center justify-between mt-1 flex-wrap gap-1">
                            <span className="text-[11px] font-bold text-sky-400 font-mono">{formatPrice(prod.price)}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold border ${
                              prod.stock && prod.stock > 0 
                                ? "bg-green-500/10 text-green-400 border-green-500/20" 
                                : "bg-red-500/10 text-red-400 border-red-500/20"
                            }`}>
                              {prod.stock && prod.stock > 0 ? "In Stock" : "Out of Stock"}
                            </span>
                          </div>
                          <div className="flex gap-1.5 mt-2">
                            <Link
                              to={`/product/${prod.id}`}
                              onClick={() => setIsOpen(false)}
                              className="text-[10px] font-bold text-center flex-1 bg-white/5 hover:bg-white/10 text-white py-1 rounded-md border border-white/10 transition-colors"
                            >
                              Details
                            </Link>
                            {prod.stock && prod.stock > 0 && (
                              <button
                                onClick={() => addToCart(prod)}
                                className="text-[10px] font-bold text-center flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-1 rounded-md transition-colors"
                              >
                                Add to Cart
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Rich Order List Render */}
                {msg.type === "orders" && msg.data && (
                  <div className="mt-2.5 space-y-2 w-full max-w-[320px] self-start animate-in fade-in duration-300">
                    {msg.data.map((order) => (
                      <div
                        key={order.id}
                        className="bg-[#1b2138] border border-white/5 rounded-xl p-3 space-y-2.5"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[11px] text-muted-foreground">Order Number</p>
                            <p className="text-xs font-mono font-bold text-white mt-0.5">{order.order_number}</p>
                          </div>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold border ${getStatusColor(order.status)}`}>
                            {order.status?.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="flex justify-between items-end border-t border-white/5 pt-2">
                          <div>
                            <p className="text-[10px] text-muted-foreground">Total: <span className="font-mono font-bold text-white">{formatPrice(order.total)}</span></p>
                            <p className="text-[9px] text-muted-foreground mt-0.5">Date: {new Date(order.created_date).toLocaleDateString()}</p>
                          </div>
                          {order.estimated_delivery && (
                            <div className="text-right">
                              <p className="text-[9px] text-muted-foreground">Est. Delivery</p>
                              <p className="text-[10px] font-bold text-sky-400 mt-0.5">{new Date(order.estimated_delivery).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Single Order Status Render */}
                {msg.type === "order-status" && msg.data && (
                  <div className="mt-2.5 w-full max-w-[320px] self-start animate-in fade-in duration-300">
                    <div className="bg-[#1b2138] border border-white/5 rounded-xl p-3.5 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] text-muted-foreground font-mono">ORDER NUMBER</p>
                          <p className="text-sm font-mono font-black text-white mt-0.5">{msg.data.order_number}</p>
                        </div>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold border ${getStatusColor(msg.data.status)}`}>
                          {msg.data.status?.replace(/_/g, " ")}
                        </span>
                      </div>

                      {/* Simple visual shipment tracker */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] text-muted-foreground font-bold">
                          <span>PLACED</span>
                          <span>SHIPPED</span>
                          <span>DELIVERED</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                          <div className={`h-full flex-1 ${["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered"].includes(msg.data.status) ? "bg-primary" : "bg-white/5"}`} />
                          <div className={`h-full flex-1 ${["shipped", "out_for_delivery", "delivered"].includes(msg.data.status) ? "bg-primary" : "bg-white/5"}`} />
                          <div className={`h-full flex-1 ${msg.data.status === "delivered" ? "bg-primary" : "bg-white/5"}`} />
                        </div>
                      </div>

                      <div className="border-t border-white/5 pt-2 flex justify-between text-[11px] text-muted-foreground">
                        <div>
                          <p>Placed: <span className="text-white font-medium">{new Date(msg.data.created_date).toLocaleDateString()}</span></p>
                          <p className="mt-0.5">Total: <span className="text-sky-400 font-mono font-bold">{formatPrice(msg.data.total)}</span></p>
                        </div>
                        {msg.data.estimated_delivery && (
                          <div className="text-right">
                            <p>Estimated Delivery</p>
                            <p className="text-white font-bold mt-0.5">{new Date(msg.data.estimated_delivery).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 self-start bg-[#161b2c] border border-white/5 px-4 py-3 rounded-2xl rounded-tl-none">
                <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            )}

            {/* Quick Suggestions (Shown initially or on empty query prompts) */}
            {messages.length === 1 && !isTyping && (
              <div className="space-y-1.5 pt-2 border-t border-white/5 mt-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
                <p className="text-[11px] text-muted-foreground font-semibold mb-1 px-1">Common Questions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt.label}
                      onClick={() => handleQuickPromptClick(prompt.text)}
                      className="text-[11px] text-white font-medium bg-[#161b2c] hover:bg-primary hover:text-primary-foreground border border-white/5 px-2.5 py-1.5 rounded-lg transition-all text-left flex items-center gap-1"
                    >
                      {prompt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="p-3 border-t border-white/5 flex gap-2 items-center bg-[#0a0d17]"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={loadingDb ? "Loading database..." : "Type a message..."}
              disabled={loadingDb}
              className="flex-1 bg-white/5 hover:bg-white/[0.08] focus:bg-white/[0.08] text-white text-xs border border-white/10 focus:border-primary focus:outline-none rounded-xl px-3 py-2.5 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loadingDb}
              className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/95 transition-all duration-200 disabled:opacity-50 flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
