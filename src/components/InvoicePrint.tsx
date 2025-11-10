import React, { forwardRef } from "react";

interface BillItem {
  id: string;
  part_number: string;
  part_name: string;
  selling_price: number;
  quantity: number;
  total: number;
}

interface InvoicePrintProps {
  billNumber: string;
  billDate: string;
  customerName: string;
  billItems: BillItem[];
  subtotal: number;
  grandTotal: number;
}

const InvoicePrint = forwardRef<HTMLDivElement, InvoicePrintProps>(
  ({ billNumber, billDate, customerName, billItems, subtotal, grandTotal }, ref) => {
    return (
      <div ref={ref} className="p-8 text-black text-sm font-sans print:bg-white">
        <div className="text-center mb-4">
          <h1 className="font-bold text-xl uppercase">
            Al-Shamali Intl. Co. Auto Parts Center
          </h1>
          <p className="text-sm font-semibold">EZZY STORE</p>
          <p className="text-xs">All Kind of Engine & Suspension Items</p>
          <h2 className="border border-black inline-block px-3 mt-2 text-xs font-semibold">
            CREDIT INVOICE
          </h2>
        </div>

        {/* Invoice details */}
        <div className="grid grid-cols-2 text-xs mb-2">
          <div>
            <p>
              <span className="font-semibold">Invoice #:</span> {billNumber}
            </p>
            <p>
              <span className="font-semibold">Measurer:</span> {customerName || "N/A"}
            </p>
          </div>
          <div className="text-right">
            <p>
              <span className="font-semibold">Branch:</span> HEAD OFFICE
            </p>
            <p>
              <span className="font-semibold">Dated:</span> {billDate}
            </p>
          </div>
        </div>

        {/* Table */}
        <table className="w-full border border-black border-collapse text-xs mb-2">
          <thead>
            <tr className="border-b border-black text-left">
              <th className="border-r border-black px-2 py-1 w-8">S.No</th>
              <th className="border-r border-black px-2 py-1">Part No</th>
              <th className="border-r border-black px-2 py-1">Description</th>
              <th className="border-r border-black px-2 py-1 w-20">Qty</th>
              <th className="border-r border-black px-2 py-1 w-24">U-Price</th>
              <th className="px-2 py-1 w-24">Amount</th>
            </tr>
          </thead>
          <tbody>
            {billItems.map((item, index) => (
              <tr key={item.id} className="border-b border-black">
                <td className="border-r border-black px-2 py-1 text-center">{index + 1}</td>
                <td className="border-r border-black px-2 py-1">{item.part_number}</td>
                <td className="border-r border-black px-2 py-1">{item.part_name}</td>
                <td className="border-r border-black px-2 py-1 text-center">{item.quantity}</td>
                <td className="border-r border-black px-2 py-1 text-right">
                  {item.selling_price.toFixed(3)}
                </td>
                <td className="px-2 py-1 text-right">{item.total.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="text-xs mt-2">
          <p className="text-right font-semibold">Sub Total: {subtotal.toFixed(3)}</p>
          <p className="text-right font-semibold">Discount: 0.000</p>
          <p className="text-right font-semibold">Net Amount: {grandTotal.toFixed(3)}</p>
          <p className="mt-1">
            <span className="font-semibold">Total Qty:</span>{" "}
            {billItems.reduce((sum, i) => sum + i.quantity, 0)}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-8 text-xs">
          <div>
            <p className="border-t border-black pt-1">Receiver</p>
          </div>
          <div>
            <p className="border-t border-black pt-1">Signature</p>
          </div>
        </div>

        <p className="text-center mt-6 text-xs">
          Shuwaikh Industrial Area, Opp. Garage Noor
        </p>
      </div>
    );
  }
);

InvoicePrint.displayName = "InvoicePrint";
export default InvoicePrint;