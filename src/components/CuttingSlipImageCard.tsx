import React from 'react';
import { CuttingOrderItem } from '@/types';
import { translateMaterialToMarathi } from '@/lib/marathi';
import { Phone, MapPin, Scissors } from 'lucide-react';

interface CuttingSlipImageCardProps {
  order: {
    estNo: string;
    date: string;
    customerName?: string;
    village?: string;
    mobileNumber?: string;
    items: CuttingOrderItem[];
    status?: string;
    cutterNotes?: string;
  };
  shopSettings?: {
    shopName?: string;
    managerName?: string;
    phone?: string;
    location?: string;
  };
}

export const CuttingSlipImageCard: React.FC<CuttingSlipImageCardProps> = ({
  order,
  shopSettings = {
    shopName: 'Bhumika Tiles & Building Material',
    managerName: 'Rohit Chavan',
    phone: '8010060992',
    location: 'Parola, Maharashtra'
  }
}) => {
  const items = order.items || [];
  const totalPcs = items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
  const totalSqft = items.reduce((sum, it) => sum + (Number(it.sqft) || 0), 0);

  return (
    <div 
      id="cutting-slip-image-card" 
      className="bg-white text-slate-950 font-sans p-6 w-[780px] min-w-[780px] max-w-[780px] mx-auto border-2 border-slate-900 rounded-2xl shadow-xl select-none"
      style={{ boxSizing: 'border-box' }}
    >
      {/* 1. Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-3">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 flex-shrink-0 bg-white p-1 rounded-xl border-2 border-slate-900 shadow-sm flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-full h-full object-contain"
              crossOrigin="anonymous"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-lg font-black uppercase tracking-tight text-slate-950 leading-snug mb-1">
              {shopSettings.shopName || 'Bhumika Tiles & Building Material'}
            </h1>
            <div className="flex items-center gap-2">
              <span className="bg-white text-slate-950 border-2 border-slate-900 px-2.5 py-0.5 rounded-md text-[10.5px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
                <Scissors size={13} className="text-slate-900" /> WORKSHOP CUTTING SLIP / कटिंग जॉब स्लिप
              </span>
            </div>
          </div>
        </div>

        <div className="text-right flex-shrink-0 text-[11px] font-bold">
          <p className="flex justify-between gap-3 font-mono">
            <span className="text-slate-600 font-sans">बिल नं (Bill No):</span> 
            <span className="font-black text-slate-950">{order.estNo}</span>
          </p>
          <p className="flex justify-between gap-3">
            <span className="text-slate-600">तारीख (Date):</span> 
            <span className="font-black text-slate-950">{order.date}</span>
          </p>
        </div>
      </div>

      {/* 2. Customer & Site details (Zero Black Box) */}
      <div className="grid grid-cols-12 gap-3 mb-3 items-stretch">
        <div className="col-span-8 bg-white border-2 border-slate-900 p-2.5 rounded-xl flex flex-col justify-between">
          <div>
            <span className="text-[8.5px] font-black uppercase text-slate-600 tracking-wider block mb-0.5">
              ग्राहकाचे नाव व पत्ता (Customer & Site):
            </span>
            <h3 className="text-base font-black text-slate-950 uppercase">
              {order.customerName || 'Walk-in Customer (ग्राहक)'}
            </h3>
          </div>
          <div className="flex items-center gap-4 mt-1.5 text-[11px] font-bold text-slate-800 border-t border-slate-200 pt-1">
            <span>गाव/पत्ता: <strong className="text-slate-950">{order.village || 'Local (स्थानिक)'}</strong></span>
            <span>•</span>
            <span className="font-mono">मोबाईल: {order.mobileNumber || 'N/A'}</span>
          </div>
        </div>

        <div className="col-span-4 bg-white border-2 border-slate-900 text-slate-950 p-2.5 rounded-xl flex flex-col justify-center items-center text-center">
          <span className="text-[9px] font-black uppercase text-slate-700 tracking-wider">एकूण माल (Total Material)</span>
          <p className="text-base font-black font-mono text-slate-950 mt-0.5">
            {totalPcs} <span className="text-xs font-bold">नग</span> • {totalSqft.toFixed(2)} <span className="text-xs font-bold">फूट</span>
          </p>
        </div>
      </div>

      {/* 3. Detailed Cutting Measurements Table (Zero Black Header) */}
      <div className="border-2 border-slate-900 rounded-xl overflow-hidden mb-3 bg-white">
        <table className="w-full table-fixed text-left text-xs border-collapse">
          <colgroup>
            <col className="w-[6%]" />
            <col className="w-[42%]" />
            <col className="w-[22%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
          </colgroup>
          <thead>
            <tr className="bg-white text-slate-950 font-black text-[9.5px] uppercase tracking-wider border-b-2 border-slate-900">
              <th className="p-2 border-r border-slate-900 text-center">#</th>
              <th className="p-2 pl-3 border-r border-slate-900 text-left">मालाचा तपशील (Material Particular)</th>
              <th className="p-2 border-r border-slate-900 text-center">कटिंग साईझ (लांबी" × रुंदी")</th>
              <th className="p-2 border-r border-slate-900 text-center">नग (Qty)</th>
              <th className="p-2 border-r border-slate-900 text-center">फूट (Sqft)</th>
              <th className="p-2 text-center">तपासणी (✓)</th>
            </tr>
          </thead>
          <tbody className="divide-y border-slate-300">
            {items.map((item, idx) => {
              const marathiName = translateMaterialToMarathi(item.particular);
              return (
                <tr key={item.id || idx} className="bg-white">
                  <td className="p-2 text-center font-bold text-slate-700 border-r border-slate-300 text-xs">
                    {idx + 1}
                  </td>
                  <td className="p-2 pl-3 font-black uppercase text-slate-950 border-r border-slate-300 text-xs truncate">
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
                  <td className="p-2 text-center font-black text-slate-950 border-r border-slate-300 text-sm font-mono">
                    {!item.isExtra && item.length && item.width ? `${item.length}" × ${item.width}"` : '-'}
                  </td>
                  <td className="p-2 text-center font-black text-slate-950 border-r border-slate-300 text-sm font-mono">
                    {item.qty} नग
                  </td>
                  <td className="p-2 text-center font-black text-slate-950 border-r border-slate-300 text-sm font-mono">
                    {!item.isExtra && item.sqft ? Number(item.sqft).toFixed(2) : '-'}
                  </td>
                  <td className="p-2 text-center">
                    <div className="w-5 h-5 border-2 border-slate-900 rounded mx-auto bg-white"></div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 4. Instructions */}
      <div className="border-2 border-slate-900 p-2.5 rounded-xl bg-white text-xs mb-3">
        <span className="font-black uppercase text-[9px] text-slate-900 block mb-0.5">
          कटर ऑपरेटर महत्वाच्या सूचना (Instructions for Cutter Operator):
        </span>
        <ul className="list-disc pl-4 text-[9px] font-bold text-slate-800 space-y-0.5">
          <li>कटिंग करण्यापूर्वी लांबी आणि रुंदीचे माप काळजीपूर्वक तपासा (दोनदा मोजा, एकदा कापा).</li>
          <li>ग्राहकाने सांगितलेली पॉलिश किंवा मोल्डिंगची धार तपासा.</li>
          <li>कटिंग झालेले सर्व नग मोजून (✓) डिलिव्हरीसाठी तयार ठेवा.</li>
        </ul>
      </div>

      {/* 5. Signatures */}
      <div className="mt-5 flex items-end justify-between px-4 text-slate-950">
        <div className="text-center w-44">
          <div className="w-full border-t-2 border-slate-900 pt-1.5 font-black text-[9.5px] uppercase tracking-wider text-slate-900">
            कटर ऑपरेटर सही (Cutter)
          </div>
        </div>

        <div className="text-center pb-1">
          <span className="text-[9.5px] font-black text-slate-900 bg-white px-3 py-1 rounded-full border-2 border-slate-900 shadow-sm">
            वर्कशॉप कटिंग स्लिप
          </span>
        </div>

        <div className="text-center w-44">
          <div className="w-full border-t-2 border-slate-900 pt-1.5 font-black text-[9.5px] uppercase tracking-wider text-slate-900">
            स्टोअर मॅनेजर सही (Manager)
          </div>
          <p className="text-[8px] font-bold text-slate-600 mt-0.5">
            {shopSettings.shopName || 'Bhumika Tiles'}
          </p>
        </div>
      </div>
    </div>
  );
};
