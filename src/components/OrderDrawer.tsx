import React, { useState } from 'react';
import { X, Trash2, CheckCircle, Copy, Send, ShoppingBag } from 'lucide-react';
import { OrderItem, CustomerOrder } from '../types/store';

interface OrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  onUpdateQuantity: (productId: string, size: string, quantity: number) => void;
  onRemoveItem: (productId: string, size: string) => void;
  onSubmitOrder: (orderData: Omit<CustomerOrder, 'id' | 'createdAt' | 'status'>) => Promise<CustomerOrder>;
  onClearCart: () => void;
}

export const OrderDrawer: React.FC<OrderDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onSubmitOrder,
  onClearCart,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [socialHandle, setSocialHandle] = useState('');
  const [email, setEmail] = useState('');
  const [fulfillmentType, setFulfillmentType] = useState<CustomerOrder['fulfillmentType']>('popup-pickup');
  const [preferredDate, setPreferredDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<CustomerOrder['paymentMethod']>('GCash / Maya');
  const [notes, setNotes] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<CustomerOrder | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!customerName || !contactNumber) {
      alert('Please provide your name and contact number so our team can confirm your reservation.');
      return;
    }

    setSubmitting(true);
    try {
      const order = await onSubmitOrder({
        customerName,
        contactNumber,
        socialHandle,
        email,
        fulfillmentType,
        preferredDate,
        paymentMethod,
        items,
        totalAmount,
        notes
      });
      setSubmittedOrder(order);
      onClearCart();
    } catch (err: any) {
      alert('Failed to submit order: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getOrderSummaryText = () => {
    if (!submittedOrder) return '';
    const itemList = submittedOrder.items
      .map(i => `• ${i.quantity}x ${i.productName} (${i.size}) - ₱${i.price * i.quantity}`)
      .join('\n');

    return `🌸 MAYUMI ACCESSORIES ORDER SLIP 🌸
Order ID: #${submittedOrder.id}
Customer: ${submittedOrder.customerName}
Contact: ${submittedOrder.contactNumber}
${submittedOrder.socialHandle ? `Social Handle: ${submittedOrder.socialHandle}` : ''}
Fulfillment: ${
      submittedOrder.fulfillmentType === 'popup-pickup'
        ? 'Pick-up at Minuyan SJDM Bulacan Booth'
        : submittedOrder.fulfillmentType === 'local-meetup'
        ? 'Local Meet-up (SJDM / Campus)'
        : 'Courier Delivery'
    }
Preferred Schedule: ${submittedOrder.preferredDate || 'Flexible'}

Items Ordered:
${itemList}

Total Amount: ₱${submittedOrder.totalAmount}
Payment Preference: ${submittedOrder.paymentMethod}
${submittedOrder.notes ? `Special Request: "${submittedOrder.notes}"` : ''}

Thank you for supporting handmade Filipino creativity! ✨`;
  };

  const handleCopySlip = () => {
    const text = getOrderSummaryText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="w-full max-w-lg bg-[#fbf7f1] h-full shadow-2xl flex flex-col border-l border-[#e6dce1] animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-[#e6dce1] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#bd7896]" />
            <h2 className="font-serif text-lg font-medium text-[#29232b]">
              {submittedOrder ? 'Order Confirmed!' : 'Your Order Bag'}
            </h2>
          </div>
          <button
            onClick={() => {
              setSubmittedOrder(null);
              onClose();
            }}
            className="p-1.5 text-[#766a75] hover:text-[#29232b] rounded-full hover:bg-slate-100"
            aria-label="Close order bag"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {submittedOrder ? (
            /* Order Success State */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#8c657f] uppercase">
                  Reservation Recorded
                </span>
                <h3 className="font-serif text-2xl text-[#29232b] mt-1">
                  Order #{submittedOrder.id}
                </h3>
                <p className="text-xs text-[#766a75] mt-2 max-w-sm mx-auto leading-relaxed">
                  Salamat, <strong>{submittedOrder.customerName}</strong>! Our partner team has received your clay clip reservation.
                </p>
              </div>

              {/* Order Slip Preview */}
              <div className="text-left bg-white p-4 rounded-lg border border-[#e6dce1] font-mono text-[11px] text-[#29232b] whitespace-pre-line leading-relaxed shadow-xs">
                {getOrderSummaryText()}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleCopySlip}
                  className="w-full py-3 px-4 bg-[#583e61] text-white text-xs font-semibold rounded-sm hover:bg-[#432d4b] transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Copy className="w-4 h-4 text-[#d989a5]" />
                  <span>{copied ? 'Order Slip Copied to Clipboard!' : 'Copy Order Slip for Instagram / FB DM'}</span>
                </button>

                <a
                  href="https://www.instagram.com/mayumihairaccessories/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-[#583e61] text-white text-xs font-semibold rounded-sm hover:bg-[#432d4b] transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5 text-[#d989a5]" />
                  <span>Message Us on Instagram (@mayumihairaccessories)</span>
                </a>

                <a
                  href="https://www.facebook.com/profile.php?id=61568215620941"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-white text-[#583e61] border border-[#d6a9bd] text-xs font-semibold rounded-sm hover:bg-[#f2dce5]/60 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5 text-[#bd7896]" />
                  <span>Message Us on Facebook Messenger</span>
                </a>

                <button
                  onClick={() => {
                    setSubmittedOrder(null);
                    onClose();
                  }}
                  className="text-xs text-[#766a75] hover:text-[#29232b] underline pt-2"
                >
                  Back to Store
                </button>
              </div>
            </div>
          ) : items.length === 0 ? (
            /* Empty Cart */
            <div className="text-center py-16 text-[#766a75]">
              <div className="w-16 h-16 rounded-full bg-[#f2dce5] text-[#583e61] flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-[#bd7896]" />
              </div>
              <h3 className="font-serif text-lg font-medium text-[#29232b]">Your bag is empty</h3>
              <p className="text-xs mt-1.5 max-w-xs mx-auto text-[#766a75]">
                Browse our handcrafted collection and click "Reserve" on any clay hair clip.
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-4 py-2 bg-[#29232b] text-white text-xs font-medium rounded-sm hover:bg-[#3d3440]"
              >
                Explore Collection
              </button>
            </div>
          ) : (
            /* Cart Items List & Checkout Form */
            <>
              {/* Items List */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-[#8c657f] uppercase tracking-wider">
                  Selected Clips ({items.reduce((s, i) => s + i.quantity, 0)})
                </div>

                <div className="divide-y divide-[#e6dce1] bg-white rounded-lg border border-[#e6dce1] px-4">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.size}`} className="py-3.5 flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-serif text-sm font-medium text-[#29232b]">{item.productName}</h4>
                        <span className="text-[10px] text-[#8c657f] font-mono">{item.size}</span>
                        <div className="text-xs text-[#bd7896] font-medium mt-0.5">₱{item.price} each</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-[#e6dce1] rounded-sm bg-[#fbf7f1]">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.productId, item.size, item.quantity - 1)}
                            className="px-2 py-0.5 text-xs text-[#766a75] hover:text-[#29232b]"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-mono font-medium text-[#29232b]">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.productId, item.size, item.quantity + 1)}
                            className="px-2 py-0.5 text-xs text-[#766a75] hover:text-[#29232b]"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.productId, item.size)}
                          className="p-1.5 text-rose-500 hover:text-rose-700"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal */}
                <div className="bg-white p-4 rounded-lg border border-[#e6dce1] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#645965]">Estimated Total:</span>
                  <span className="font-serif text-xl font-medium text-[#bd7896]">₱{totalAmount}</span>
                </div>
              </div>

              {/* Reservation / Checkout Details Form */}
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="text-xs font-bold text-[#8c657f] uppercase tracking-wider">
                  Reservation Details
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#29232b] mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Katrina Burdeos"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-[#e6dce1] rounded-sm focus:outline-none focus:border-[#d989a5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#29232b] mb-1">Contact / Mobile # *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0917-123-4567"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-[#e6dce1] rounded-sm focus:outline-none focus:border-[#d989a5]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#29232b] mb-1">Instagram / Facebook Handle</label>
                    <input
                      type="text"
                      placeholder="e.g. @katrina_b"
                      value={socialHandle}
                      onChange={(e) => setSocialHandle(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-[#e6dce1] rounded-sm focus:outline-none focus:border-[#d989a5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#29232b] mb-1">Email Address (Optional)</label>
                    <input
                      type="email"
                      placeholder="you@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-[#e6dce1] rounded-sm focus:outline-none focus:border-[#d989a5]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#29232b] mb-1">How would you like to receive your clip? *</label>
                  <select
                    value={fulfillmentType}
                    onChange={(e) => setFulfillmentType(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-white border border-[#e6dce1] rounded-sm focus:outline-none focus:border-[#d989a5]"
                  >
                    <option value="popup-pickup">Pick up at Minuyan SJDM Bulacan Booth (Free)</option>
                    <option value="local-meetup">Meet-up near City College SJDM / Nearby Campus</option>
                    <option value="courier-delivery">Local Courier Delivery (Bulacan / Metro Manila)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#29232b] mb-1">Preferred Pickup / Meet-up Date</label>
                  <input
                    type="text"
                    placeholder="e.g. This Saturday 2:00 PM"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-[#e6dce1] rounded-sm focus:outline-none focus:border-[#d989a5]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#29232b] mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-white border border-[#e6dce1] rounded-sm focus:outline-none focus:border-[#d989a5]"
                  >
                    <option value="GCash / Maya">GCash / Maya</option>
                    <option value="Cash on Pickup / Meet-up">Cash upon Pickup / Meet-up</option>
                    <option value="Bank Transfer">Bank Transfer (BDO/BPI)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#29232b] mb-1">Custom Notes / Color Requests</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Please wrap with gift ribbon, extra pink petals if possible!"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-[#e6dce1] rounded-sm focus:outline-none focus:border-[#d989a5]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-4 bg-[#29232b] text-white text-xs sm:text-sm font-semibold rounded-sm hover:bg-[#3d3440] transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Submitting Reservation...' : `Confirm & Place Order (₱${totalAmount})`}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
