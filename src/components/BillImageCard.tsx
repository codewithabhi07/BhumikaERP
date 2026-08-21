import React from 'react';
import { EstimateItem } from '@/types';
import { numberToWords } from '@/lib/utils';
import { numberToMarathiWords, translateMaterialToMarathi } from '@/lib/marathi';
import { CheckCircle2, AlertCircle, Phone, MapPin } from 'lucide-react';

interface BillImageCardProps {
  estimate: {
    estNo: string;
    date: string;
    customerName?: string;
    village?: string;
    mobileNumber?: string;
    items: EstimateItem[];
    subTotal: number;
    discount?: number;
    gstType?: 'none' | 'sgst_cgst' | 'igst';
    gstRate?: number;
    grandTotal: number;
    paidAmount?: number;
    balance: number;
  };
  shopSettings?: {
    shopName?: string;
    managerName?: string;
    phone?: string;
    location?: string;
  };
}

export const BillImageCard: React.FC<BillImageCardProps> = ({
  estimate,
  shopSettings = {
    shopName: 'Bhumika Tiles & Building Material',
    managerName: 'Rohit Chavan',
    phone: '8010060992',
    location: 'Parola, Maharashtra'
  }
}) => {
  const items = estimate.items || [];
  const subTotal = estimate.subTotal || 0;
  const discount = estimate.discount || 0;
  const gstType = estimate.gstType || 'none';
  const gstRate = estimate.gstRate || 18;
  const gstTotal = gstType !== 'none' ? ((subTotal - discount) * (gstRate / 100)) : 0;
  const grandTotal = estimate.grandTotal || 0;
  const paidAmount = estimate.paidAmount || 0;
  const balance = estimate.balance ?? (grandTotal - paidAmount);
  const isPaid = balance <= 0;

  return (
    <div 
      id="bill-image-card" 
      className="bg-white text-slate-950 font-sans p-6 w-[780px] min-w-[780px] max-w-[780px] mx-auto border-2 border-slate-900 rounded-2xl shadow-xl select-none"
      style={{ boxSizing: 'border-box' }}
    >
      {/* 1. Header Banner */}
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-3">
        <div className="flex items-center gap-3.5">
          <div className="w-16 h-16 flex-shrink-0 bg-white p-1 rounded-xl border-2 border-slate-900 shadow-sm flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-full h-full object-contain"
              crossOrigin="anonymous"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-950 leading-snug">
              {shopSettings.shopName || 'Bhumika Tiles & Building Material'}
            </h1>
            <p className="text-[10.5px] font-bold text-slate-800 mt-0.5">
              भूमिका टाईल्स, ग्रॅनाईट, प्लायवूड व बिल्डिंग मटेरिअल्स
            </p>
            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-700 mt-0.5">
              <span className="flex items-center gap-1">
                <MapPin size={11} className="text-slate-800" /> {shopSettings.location || 'Parola'} (पारोळा)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone size={11} className="text-slate-800" /> मो.: {shopSettings.phone || '8010060992'}
              </span>
            </div>
          </div>
        </div>

        {/* Invoice Type & Number Badge (Clean White Outlined) */}
        <div className="text-right flex-shrink-0">
          <div className="border-2 border-slate-900 bg-white text-slate-950 px-3 py-1 rounded-lg text-center mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider block">
              ESTIMATE BILL / अंदाज बिल
            </span>
          </div>
          <div className="text-[10.5px] font-bold space-y-0.5 text-slate-900">
            <p className="flex justify-between gap-3 font-mono">
              <span className="text-slate-600 font-sans">बिल नं (Bill No):</span> 
              <span className="font-black text-slate-950">{estimate.estNo}</span>
            </p>
            <p className="flex justify-between gap-3">
              <span className="text-slate-600">तारीख (Date):</span> 
              <span className="font-black text-slate-950">{estimate.date}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Customer & Status Section (Symmetrical Alignment) */}
      <div className="grid grid-cols-12 gap-3 mb-3 items-stretch">
        {/* Customer Details Box */}
        <div className="col-span-8 bg-white border-2 border-slate-900 p-2.5 rounded-xl flex flex-col justify-between">
          <div>
            <span className="text-[8.5px] font-black uppercase text-slate-600 tracking-wider block mb-0.5">
              ग्राहकाचे नाव (Billed To Customer):
            </span>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-black text-slate-950 uppercase tracking-tight">
                {estimate.customerName || 'Walk-in Customer (रोख ग्राहक)'}
              </h3>
              {estimate.village && (
                <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-slate-900 text-slate-950 whitespace-nowrap">
                  गाव/पत्ता: {estimate.village}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 mt-1.5 text-[10.5px] font-bold text-slate-800 border-t border-slate-200 pt-1">
            <p className="flex items-center gap-1 font-mono">
              <Phone size={11} className="text-slate-700" />
              <span>मोबाईल: {estimate.mobileNumber ? `+91 ${estimate.mobileNumber}` : 'N/A'}</span>
            </p>
            {!estimate.village && <span className="text-slate-500">गाव/पत्ता: Local (स्थानिक)</span>}
          </div>
        </div>

        {/* Payment Status Box (Clean Outlined) */}
        <div className={`col-span-4 p-2.5 rounded-xl border-2 flex flex-col justify-center items-center text-center bg-white ${
          isPaid 
            ? 'border-emerald-800 text-emerald-950' 
            : 'border-slate-900 text-slate-950'
        }`}>
          <div className="flex items-center gap-1.5 mb-0.5">
            {isPaid ? (
              <CheckCircle2 size={15} className="text-emerald-800" />
            ) : (
              <AlertCircle size={15} className="text-slate-900" />
            )}
            <span className="text-[9.5px] font-black uppercase tracking-wider">
              {isPaid ? 'पूर्ण जमा (FULL PAID)' : 'बाकी रक्कम (BALANCE DUE)'}
            </span>
          </div>
          <div className="text-sm font-black font-mono">
            {isPaid ? (
              <span className="text-emerald-900">₹0 बाकी (PAID)</span>
            ) : (
              <span className="text-slate-950">बाकी: ₹{balance.toLocaleString('en-IN')}</span>
            )}
          </div>
          <span className="text-[9px] font-bold text-slate-600 mt-0.5">
            {isPaid ? 'कोणतीही बाकी शिल्लक नाही' : `जमा: ₹${paidAmount.toLocaleString('en-IN')}`}
          </span>
        </div>
      </div>

      {/* 3. Items Table (Zero Black Header - Perfectly Aligned Columns) */}
      <div className="border-2 border-slate-900 rounded-xl overflow-hidden mb-3 bg-white">
        <table className="w-full table-fixed text-left text-xs border-collapse">
          <colgroup>
            <col className="w-[5%]" />
            <col className="w-[37%]" />
            <col className="w-[18%]" />
            <col className="w-[8%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[12%]" />
          </colgroup>
          <thead>
            <tr className="bg-white text-slate-950 font-black text-[9.5px] uppercase tracking-wider border-b-2 border-slate-900">
              <th className="p-2 border-r border-slate-900 text-center">#</th>
              <th className="p-2 pl-3 border-r border-slate-900 text-left">मालाचा तपशील (Description)</th>
              <th className="p-2 border-r border-slate-900 text-center">साईझ (L × W)</th>
              <th className="p-2 border-r border-slate-900 text-center">नग (Qty)</th>
              <th className="p-2 border-r border-slate-900 text-center">फूट (Sqft)</th>
              <th className="p-2 pr-3 border-r border-slate-900 text-right">दर (Rate ₹)</th>
              <th className="p-2 pr-3 text-right">रक्कम (Amount ₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y border-slate-300">
            {items.map((item, idx) => {
              const marathiName = translateMaterialToMarathi(item.particular);
              return (
                <tr key={item.id || idx} className="bg-white">
                  <td className="p-1.5 text-center font-bold text-slate-700 border-r border-slate-300 text-[10.5px]">
                    {idx + 1}
                  </td>
                  <td className="p-1.5 pl-3 font-black uppercase text-slate-950 border-r border-slate-300 text-[10.5px] truncate">
                    <div className="flex items-center flex-wrap gap-1">
                      <span>{item.particular}</span>
                      {marathiName && (
                        <span className="text-[9px] font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 normal-case">
                          {marathiName}
                        </span>
                      )}
                      {item.isExtra && (
                        <span className="text-[8px] font-bold bg-slate-100 text-slate-800 px-1 py-0.5 rounded border border-slate-300 lowercase">
                          नग
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-1.5 text-center font-bold text-slate-900 border-r border-slate-300 text-[10.5px] font-mono">
                    {!item.isExtra && item.length && item.width ? `${item.length}" × ${item.width}"` : '-'}
                  </td>
                  <td className="p-1.5 text-center font-bold text-slate-950 border-r border-slate-300 text-[10.5px] font-mono">
                    {item.qty}
                  </td>
                  <td className="p-1.5 text-center font-black text-slate-950 border-r border-slate-300 text-[10.5px] font-mono">
                    {!item.isExtra && item.sqft ? item.sqft.toFixed(2) : '-'}
                  </td>
                  <td className="p-1.5 pr-3 text-right font-bold text-slate-950 border-r border-slate-300 text-[10.5px] font-mono">
                    ₹{Number(item.rate || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="p-1.5 pr-3 text-right font-black text-slate-950 text-[10.5px] font-mono">
                    ₹{Number(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 4. Financial Calculation Summary & Words (Zero Black Bar) */}
      <div className="grid grid-cols-12 gap-3 items-start mb-3">
        {/* Left Side: Amount in words & Terms */}
        <div className="col-span-7 space-y-2">
          {/* Amount in Marathi Words */}
          <div className="border-2 border-slate-900 p-2 rounded-xl bg-white">
            <span className="text-[8px] font-black uppercase text-slate-600 tracking-wider block mb-0.5">
              अक्षरी एकूण रक्कम (Amount in Words):
            </span>
            <p className="text-[11px] font-black text-slate-950 leading-snug">
              {numberToMarathiWords(grandTotal)}
            </p>
            <p className="text-[9px] font-bold text-slate-600 uppercase mt-0.5">
              ({numberToWords(grandTotal)} Rupees Only)
            </p>
          </div>

          {/* Terms in Marathi */}
          <div className="border-l-2 border-slate-900 pl-2.5 py-0.5 text-[8px] font-bold text-slate-700 leading-tight space-y-0.5">
            <p className="font-black uppercase text-slate-900">नियम व अटी (Terms & Conditions):</p>
            <p>१. विकलेला माल परत अथवा बदलून घेतला जाणार नाही.</p>
            <p>२. डिलिव्हरीच्या वेळी मालाचे माप व गुणवत्ता तपासून घ्यावी.</p>
          </div>
        </div>

        {/* Right Side: Totals Card (Clean White Outlined) */}
        <div className="col-span-5 border-2 border-slate-900 rounded-xl overflow-hidden text-xs bg-white">
          <div className="p-1.5 px-3 border-b border-slate-300 flex justify-between items-center font-bold text-[9.5px] text-slate-700 uppercase">
            <span>निव्वळ बेरीज (Subtotal)</span>
            <span className="font-mono text-slate-950 font-bold text-right">₹{subTotal.toFixed(2)}</span>
          </div>

          {gstType !== 'none' && (
            <div className="p-1.5 px-3 border-b border-slate-300 flex justify-between items-center font-bold text-[9.5px] text-slate-700 uppercase">
              <span>जीएसटी कर (GST {gstRate}%)</span>
              <span className="font-mono text-slate-950 font-bold text-right">₹{gstTotal.toFixed(2)}</span>
            </div>
          )}

          {discount > 0 && (
            <div className="p-1.5 px-3 border-b border-slate-300 flex justify-between items-center font-bold text-[9.5px] text-slate-700 uppercase">
              <span>सूट (Discount)</span>
              <span className="font-mono font-bold text-slate-950 text-right">- ₹{discount.toFixed(2)}</span>
            </div>
          )}

          {/* Grand Total Row (Clean White with Double Border - Zero Black Bar) */}
          <div className="p-1.5 px-3 border-t-2 border-b-2 border-slate-900 bg-white text-slate-950 flex justify-between items-center font-black text-xs uppercase tracking-wider">
            <span>अंतिम एकूण (Total)</span>
            <span className="font-mono text-sm text-slate-950 font-black text-right">
              ₹{grandTotal.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-1.5 px-3 border-b border-slate-300 flex justify-between items-center font-bold text-[9.5px] text-slate-700 uppercase bg-white">
            <span>जमा रक्कम (Paid)</span>
            <span className="font-mono font-bold text-slate-950 text-right">₹{paidAmount.toLocaleString('en-IN')}</span>
          </div>

          <div className="p-1.5 px-3 flex justify-between items-center font-black text-xs uppercase bg-white text-slate-950">
            <span>बाकी रक्कम (Balance)</span>
            <span className="font-mono text-sm font-black text-right">
              ₹{balance.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Signatures & Footer Note (Proper Alignment) */}
      <div className="mt-4 flex items-end justify-between px-3 text-slate-950">
        <div className="text-center w-36">
          <div className="w-full border-t-2 border-slate-900 pt-1.5 font-black text-[9px] uppercase tracking-wider text-slate-900">
            ग्राहकाची सही (Customer)
          </div>
        </div>

        <div className="text-center pb-1">
          <span className="text-[9.5px] font-black text-slate-900 bg-white px-3 py-1 rounded-full border-2 border-slate-900 shadow-sm">
            धन्यवाद! पुन्हा भेट द्या.
          </span>
        </div>

        <div className="text-center w-44">
          <div className="w-full border-t-2 border-slate-900 pt-1.5 font-black text-[9px] uppercase tracking-wider text-slate-900">
            अधिकृत सही (Signatory)
          </div>
          <p className="text-[8px] font-bold text-slate-600 mt-0.5">
            {shopSettings.shopName || 'Bhumika Tiles'}
          </p>
        </div>
      </div>
    </div>
  );
};

