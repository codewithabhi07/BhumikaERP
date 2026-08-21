import React from 'react';
import { DeliveryChallanItem } from '@/types';
import { translateMaterialToMarathi } from '@/lib/marathi';
import { Truck, Phone, MapPin } from 'lucide-react';

interface ChallanImageCardProps {
  challan: {
    challanNo: string;
    estNo: string;
    date: string;
    customerName?: string;
    village?: string;
    mobileNumber?: string;
    deliveryAddress?: string;
    vehicleNo?: string;
    driverName?: string;
    items: DeliveryChallanItem[];
  };
  shopSettings?: {
    shopName?: string;
    managerName?: string;
    phone?: string;
    location?: string;
  };
}

export const ChallanImageCard: React.FC<ChallanImageCardProps> = ({
  challan,
  shopSettings = {
    shopName: 'Bhumika Tiles & Building Material',
    managerName: 'Rohit Chavan',
    phone: '8010060992',
    location: 'Parola, Maharashtra'
  }
}) => {
  const items = challan.items || [];
  const totalPcs = items.reduce((sum, it) => sum + (Number(it.dispatchedQty) || 0), 0);

  return (
    <div 
      id="challan-image-card" 
      className="bg-white text-slate-950 font-sans p-6 w-[780px] min-w-[780px] max-w-[780px] mx-auto border-2 border-slate-900 rounded-2xl shadow-xl select-none"
      style={{ boxSizing: 'border-box' }}
    >
      {/* 1. Header Banner */}
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-3">
        <div className="flex items-center gap-3">
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
                <Truck size={13} className="text-slate-900" /> DELIVERY DISPATCH CHALLAN / डिलिव्हरी चलन
              </span>
            </div>
          </div>
        </div>

        <div className="text-right flex-shrink-0 text-[11px] font-bold">
          <p className="flex justify-between gap-3 font-mono">
            <span className="text-slate-600 font-sans">चलन नं (Challan No):</span> 
            <span className="font-black text-slate-950">{challan.challanNo}</span>
          </p>
          <p className="flex justify-between gap-3 font-mono">
            <span className="text-slate-600 font-sans">बिल नं (Bill Ref):</span> 
            <span className="font-black text-slate-950">{challan.estNo}</span>
          </p>
          <p className="flex justify-between gap-3">
            <span className="text-slate-600">तारीख (Date):</span> 
            <span className="font-black text-slate-950">{challan.date}</span>
          </p>
        </div>
      </div>

      {/* 2. Customer & Transport Details */}
      <div className="grid grid-cols-12 gap-3 mb-3 items-stretch">
        <div className="col-span-7 bg-white border-2 border-slate-900 p-2.5 rounded-xl flex flex-col justify-between">
          <div>
            <span className="text-[8.5px] font-black uppercase text-slate-600 tracking-wider block mb-0.5">
              ग्राहकाचे नाव व पत्ता (Consignee / Customer):
            </span>
            <h3 className="text-base font-black text-slate-950 uppercase">
              {challan.customerName || 'Customer (ग्राहक)'}
            </h3>
          </div>
          <div className="text-[11px] font-semibold text-slate-800 mt-1.5 space-y-0.5 border-t border-slate-200 pt-1">
            <p>पत्ता / साईट: <strong className="text-slate-950">{challan.deliveryAddress || challan.village || 'Parola / Site'}</strong></p>
            <p className="font-mono">मोबाईल: {challan.mobileNumber || 'N/A'}</p>
          </div>
        </div>

        <div className="col-span-5 bg-white border-2 border-slate-900 p-2.5 rounded-xl text-xs flex flex-col justify-between">
          <span className="text-[8.5px] font-black uppercase text-slate-700 tracking-wider block mb-0.5">
            वाहतूक व गाडी तपशील (Vehicle & Dispatch Info):
          </span>
          <div className="font-bold text-slate-900 space-y-1 mt-1">
            <p className="flex justify-between">
              <span className="text-slate-600">गाडी नंबर (Vehicle No):</span>
              <span className="font-black font-mono">{challan.vehicleNo || 'Direct Handover (स्वतः)'}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-600">ड्रायव्हर (Driver):</span>
              <span className="font-black">{challan.driverName || 'Self / इतर'}</span>
            </p>
            <p className="flex justify-between border-t border-slate-200 pt-0.5">
              <span className="text-slate-600">एकूण माल (Total Items):</span>
              <span className="font-black font-mono text-slate-950">{totalPcs} नग (Dispatched)</span>
            </p>
          </div>
        </div>
      </div>

      {/* 3. Dispatched Goods Table (Zero Black Header) */}
      <div className="border-2 border-slate-900 rounded-xl overflow-hidden mb-3 bg-white">
        <table className="w-full table-fixed text-left text-xs border-collapse">
          <colgroup>
            <col className="w-[6%]" />
            <col className="w-[44%]" />
            <col className="w-[22%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
          </colgroup>
          <thead>
            <tr className="bg-white text-slate-950 font-black text-[9.5px] uppercase tracking-wider border-b-2 border-slate-900">
              <th className="p-2 border-r border-slate-900 text-center">#</th>
              <th className="p-2 pl-3 border-r border-slate-900 text-left">मालाचा तपशील (Description of Goods)</th>
              <th className="p-2 border-r border-slate-900 text-center">साईझ (L × W)</th>
              <th className="p-2 border-r border-slate-900 text-center">पाठवलेले नग (Qty)</th>
              <th className="p-2 text-center">फूट (Sq. Ft.)</th>
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
                      <span className="truncate">{item.particular}</span>
                      {marathiName && (
                        <span className="text-[9px] font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 normal-case">
                          {marathiName}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-2 text-center font-bold text-slate-900 border-r border-slate-300 text-xs font-mono">
                    {!item.isExtra && item.length && item.width ? `${item.length}" × ${item.width}"` : '-'}
                  </td>
                  <td className="p-2 text-center font-black text-slate-950 border-r border-slate-300 text-xs font-mono">
                    {item.dispatchedQty} नग
                  </td>
                  <td className="p-2 text-center font-black text-slate-950 text-xs font-mono">
                    {!item.isExtra && item.sqft ? Number(item.sqft).toFixed(2) : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 4. Verification Terms */}
      <div className="border-2 border-slate-900 p-2 rounded-xl bg-white text-xs mb-3">
        <p className="text-[8.5px] font-bold text-slate-800 leading-tight">
          वरील सर्व माल चांगल्या स्थितीत, पूर्ण मोजमापाने आणि कोणत्याही नुकसानीशिवाय मिळाला आहे. (Received in good condition).
        </p>
      </div>

      {/* 5. Signatures */}
      <div className="mt-4 flex items-end justify-between px-4 text-slate-950">
        <div className="text-center w-40">
          <div className="w-full border-t-2 border-slate-900 pt-1.5 font-black text-[9px] uppercase tracking-wider text-slate-900">
            माल घेणाऱ्याची सही (Receiver)
          </div>
        </div>

        <div className="text-center w-36">
          <div className="w-full border-t-2 border-slate-900 pt-1.5 font-black text-[9px] uppercase tracking-wider text-slate-900">
            ड्रायव्हर सही (Driver)
          </div>
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
