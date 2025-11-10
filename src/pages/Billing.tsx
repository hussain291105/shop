import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Plus, X, Trash2, Save, Printer } from "lucide-react";
import { toast } from "sonner";
import "./billing-print.css";

interface SparePart {
  id: string;
  part_number: string;
  part_name: string;
  selling_price: number;
  stock_quantity: number;
  unit: string;
}

interface BillItem extends SparePart {
  quantity: number;
  custom_price: number;
  total: number;
}

interface SavedBill {
  id: string;
  bill_number: string;
  customer_name: string;
  total_amount: number;
  created_at: string;
}

const Billing = () => {
  const [showBillForm, setShowBillForm] = useState(false);
  const [billNumber, setBillNumber] = useState("");
  const [billDate, setBillDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [parts, setParts] = useState<SparePart[]>([]);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [savedBills, setSavedBills] = useState<SavedBill[]>([]);
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [customPrice, setCustomPrice] = useState<number | "">("");
  const printRef = useRef<HTMLDivElement>(null);

  // ✅ Reliable manual print method (works across browsers)
  const handlePrint = () => {
  try {
    if (!billItems.length) {
      toast.error("No items to print.");
      return;
    }

    // Create a hidden iframe for printing
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow?.document;
    if (!doc) {
      toast.error("Unable to access print window.");
      return;
    }

    // Build rows dynamically
    const rows = billItems
      .map(
        (item, index) => `
          <tr>
            <td style="text-align:center;">${index + 1}</td>
            <td style="text-align:center;">${item.part_number}</td>
            <td>${item.part_name}</td>
            <td style="text-align:center;">-</td>
            <td style="text-align:center;">${item.quantity}</td>
            <td style="text-align:right;">₹${item.custom_price.toFixed(2)}</td>
            <td style="text-align:right;">₹${item.total.toFixed(2)}</td>
          </tr>
        `
      )
      .join("");

    // Open and write printable HTML
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Invoice_${billNumber}</title>
          <style>
            @page {
              size: A4;
              margin: 10mm;
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              color: #000;
              margin: 0;
              padding: 0;
              display: flex;
              flex-direction: column;
              height: 100%;
            }

            /* Header */
            .header {
              border: 1px solid #000;
              background: #f2f2f2;
              text-align: center;
              padding: 8px;
              font-weight: bold;
            }

            .sub-header {
              text-align: center;
              font-size: 11px;
              margin-bottom: 4px;
            }

            /* Invoice Info */
            .info {
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              padding: 5px 10px;
            }

            /* Tables */
            table {
              width: 100%;
              border-collapse: collapse;
            }

            th, td {
              border: 1px solid #000;
              padding: 4px;
              vertical-align: top;
            }

            th {
              background: #f8f8f8;
              text-align: center;
            }

            .totals {
              margin-top: auto;
              border-top: 1px solid #000;
            }

            .totals td {
              border: none;
              padding: 3px 5px;
              font-size: 12px;
            }

            .footer {
              margin-top: 15mm;
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              border-top: 1px solid #000;
              padding-top: 5mm;
            }

            .bottom {
              margin-top: auto;
            }

            .address {
              text-align: center;
              font-size: 11px;
              margin-top: 5mm;
            }
          </style>
        </head>
        <body>
          <div class="header">
            Al-Shamali Intl. Co. Auto Parts Center
          </div>
          <div class="sub-header">
            EZZY STORE — All Kind of Engine & Suspension Items
          </div>

          <div class="info">
            <div>
              Invoice #: ${billNumber}<br>
              Messers: ${customerName || "N/A"}
            </div>
            <div style="text-align:right;">
              Branch: Main<br>
              Date: ${billDate}
            </div>
          </div>

          <div style="text-align:center; margin:6px 0;">
            <button style="border:1px solid #000; background:#fff; padding:2px 10px; font-size:11px;">CREDIT INVOICE</button>
          </div>

          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Part No.</th>
                <th>Part No. & Description</th>
                <th>Brand</th>
                <th>Qty</th>
                <th>U-Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <div class="bottom">
            <table style="margin-top:10px;">
              <tr>
                <td colspan="6" style="text-align:right; border:none;">Sub Total:</td>
                <td style="text-align:right; border:none;">₹${subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="6" style="text-align:right; border:none;">Discount:</td>
                <td style="text-align:right; border:none;">₹0.00</td>
              </tr>
              <tr>
                <td colspan="6" style="text-align:right; border:none;"><strong>Net Amount:</strong></td>
                <td style="text-align:right; border:none;"><strong>₹${subtotal.toFixed(2)}</strong></td>
              </tr>
            </table>

            <p style="margin-top:10px;">Total Qty: ${billItems.reduce((sum, i) => sum + i.quantity, 0)}</p>

            <div class="footer">
              <p>Receiver ___________________</p>
              <p>Signature ___________________</p>
            </div>

            <div class="address">
              Shuwaikh Industrial Area, Opp. Garage Noor
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    // ✅ Ensure the print window triggers properly
    setTimeout(() => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      document.body.removeChild(printFrame);
    }, 600);
  } catch (err) {
    console.error("Print error:", err);
    toast.error("🧾 Unable to print invoice.");
  }
};

  useEffect(() => {
    fetchParts();
    fetchSavedBills();
  }, []);

  const fetchParts = async () => {
    const { data, error } = await supabase.from("spare_parts").select("*");
    if (error) toast.error("Failed to load parts");
    else setParts(data || []);
  };

  const fetchSavedBills = async () => {
    const { data, error } = await supabase
      .from("bills")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load saved bills");
    else setSavedBills(data || []);
  };

  const startNewBill = () => {
    setBillNumber("INV-" + Date.now().toString().slice(-6));
    setBillDate(new Date().toLocaleString());
    setCustomerName("");
    setBillItems([]);
    setShowBillForm(true);
  };

  const cancelBill = () => {
    setShowBillForm(false);
    setSelectedPart(null);
    setQuantity(1);
    setCustomPrice("");
  };

  const addItem = () => {
    if (!selectedPart) {
      toast.error("Please select a part");
      return;
    }
    if (!quantity || quantity <= 0) {
      toast.error("Enter valid quantity");
      return;
    }

    const price =
      customPrice && customPrice > 0
        ? Number(customPrice)
        : selectedPart.selling_price;

    const existing = billItems.find((i) => i.id === selectedPart.id);
    if (existing) {
      toast.error("This item is already in the bill");
      return;
    }

    const newItem: BillItem = {
      ...selectedPart,
      quantity,
      custom_price: price,
      total: quantity * price,
    };

    setBillItems([...billItems, newItem]);
    setSelectedPart(null);
    setQuantity(1);
    setCustomPrice("");
  };

  const removeItem = (id: string) => {
    setBillItems((prev) => prev.filter((i) => i.id !== id));
  };

  const subtotal = billItems.reduce((sum, i) => sum + i.total, 0);

  const saveBill = async () => {
    if (billItems.length === 0) {
      toast.error("Add at least one item before saving the bill");
      return;
    }

    try {
      const { data: billData, error: billError } = await supabase
        .from("bills")
        .insert([
          {
            bill_number: billNumber,
            customer_name: customerName || "N/A",
            total_amount: subtotal,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (billError) throw billError;

      const itemsData = billItems.map((item) => ({
        bill_id: billData.id,
        part_number: item.part_number,
        part_name: item.part_name,
        quantity: item.quantity,
        total: item.total,
        unit_price: item.custom_price,
      }));

      const { error: itemsError } = await supabase
        .from("bill_items")
        .insert(itemsData);

      if (itemsError) console.warn("Warning:", itemsError.message);

      toast.success("✅ Bill saved successfully!");
      setShowBillForm(false);
      fetchSavedBills();
    } catch (err) {
      console.error(err);
      toast.error("Error saving bill. Please try again.");
    }
  };

  const deleteBill = async (billId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this bill?"
    );
    if (!confirmDelete) return;

    try {
      const { error: itemsError } = await supabase
        .from("bill_items")
        .delete()
        .eq("bill_id", billId);

      if (itemsError) throw itemsError;

      const { error: billError } = await supabase
        .from("bills")
        .delete()
        .eq("id", billId);

      if (billError) throw billError;

      toast.success("🗑️ Bill deleted successfully!");
      fetchSavedBills();
    } catch (err) {
      console.error(err);
      toast.error("Error deleting bill.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        🧾 Billing Section
      </h1>

      {!showBillForm ? (
        <>
          <div className="flex justify-center items-center h-40">
            <Button
              onClick={startNewBill}
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-6 py-3 rounded-lg shadow-md"
            >
              + Add New Bill
            </Button>
          </div>

          {savedBills.length > 0 && (
            <div className="border rounded-lg p-4 bg-white shadow-sm mt-6">
              <h2 className="text-xl font-semibold mb-3">Saved Bills</h2>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead>Bill No</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {savedBills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell>{bill.bill_number}</TableCell>
                      <TableCell>{bill.customer_name}</TableCell>
                      <TableCell>
                        {new Date(bill.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>₹{bill.total_amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteBill(bill.id)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="border rounded-lg p-4 bg-white shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold">Generate Bill</h2>
                <p className="text-gray-500 text-sm">
                  Bill No: <span className="font-medium">{billNumber}</span> | Date:{" "}
                  <span>{billDate}</span>
                </p>
              </div>

              <Button
                variant="destructive"
                onClick={cancelBill}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Cancel
              </Button>
            </div>

            <Input
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="max-w-md"
            />

            {/* Select Parts */}
            <div className="flex flex-wrap gap-3 items-center">
              <select
                className="border rounded-md p-2 w-64"
                value={selectedPart ? String(selectedPart.id) : ""}
                onChange={(e) => {
                  const part = parts.find((p) => String(p.id) === e.target.value);
                  setSelectedPart(part || null);
                }}
              >
                <option value="">Select Part...</option>
                {parts.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.part_number} - {p.part_name}
                  </option>
                ))}
              </select>

              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-32"
                placeholder="Qty"
              />

              <Input
                type="number"
                min={0}
                value={customPrice}
                onChange={(e) =>
                  setCustomPrice(e.target.value ? Number(e.target.value) : "")
                }
                className="w-40"
                placeholder="Custom Price"
              />

              <Button onClick={addItem} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </div>

            {/* ✅ Printable Invoice Section */}
            <div ref={printRef} className="mt-6 border p-6 text-sm font-mono">
              <div className="text-center mb-4">
                <h2 className="text-lg font-bold uppercase">
                  AL-SHAMALI INTL. CO. AUTO PARTS CENTER
                </h2>
                <p className="text-xs">
                  EZZY STORE — All Kind of Engine & Suspension Items
                </p>
                <h3 className="mt-2 border w-fit px-3 py-1 mx-auto text-sm">
                  CREDIT INVOICE
                </h3>
              </div>

              <div className="flex justify-between text-xs mb-3">
                <div>
                  Invoice #: {billNumber} <br />
                  Messers: {customerName || "N/A"}
                </div>
                <div className="text-right">
                  Date: {billDate}
                  <br />
                  Branch: Main
                </div>
              </div>

              <table className="w-full border-collapse border text-xs mb-3">
                <thead>
                  <tr className="border">
                    <th className="border p-1 w-10">S.No</th>
                    <th className="border p-1 w-24">Part No</th>
                    <th className="border p-1">Description</th>
                    <th className="border p-1 w-24">Brand</th>
                    <th className="border p-1 w-12">Qty</th>
                    <th className="border p-1 w-20">U-Price</th>
                    <th className="border p-1 w-20">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {billItems.map((item, index) => (
                    <tr key={item.id}>
                      <td className="border p-1 text-center">{index + 1}</td>
                      <td className="border p-1 text-center">{item.part_number}</td>
                      <td className="border p-1">{item.part_name}</td>
                      <td className="border p-1 text-center">-</td>
                      <td className="border p-1 text-center">{item.quantity}</td>
                      <td className="border p-1 text-right">
                        ₹{item.custom_price.toFixed(2)}
                      </td>
                      <td className="border p-1 text-right">
                        ₹{item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="text-right text-sm mt-4">
                <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
                <p>Discount: ₹0.00</p>
                <p className="font-semibold">Net Amount: ₹{subtotal.toFixed(2)}</p>
              </div>

              <div className="flex justify-between text-xs mt-6 pt-4 border-t">
                <p>Receiver ___________________</p>
                <p>Signature ___________________</p>
              </div>
            </div>

            {/* ✅ Save + Print Actions */}
            {billItems.length > 0 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-lg font-semibold">
                  Total: ₹{subtotal.toFixed(2)}
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={saveBill}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Save Bill
                  </Button>
                  <Button
                    onClick={handlePrint}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" /> Print Invoice
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Billing;
