import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { X, Save } from "lucide-react";

interface SparePart {
  id: string;
  part_number: string;
  part_name: string;
  selling_price: number;
  stock_quantity: number;
  unit: string;
}

const AddItem = () => {
  const [parts, setParts] = useState<SparePart[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
  const [customPrice, setCustomPrice] = useState<number | "">("");
  const [quantity, setQuantity] = useState<number>(1);

  const navigate = useNavigate();

  // Fetch all parts from Supabase
  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    const { data, error } = await supabase
      .from("spare_parts")
      .select("id, part_number, part_name, selling_price, stock_quantity, unit");
    if (error) toast.error("Error loading parts");
    else setParts(data || []);
  };

  const handleSave = () => {
    if (!selectedPart) {
      toast.error("Please select a part");
      return;
    }
    if (!customPrice || customPrice <= 0) {
      toast.error("Enter a valid selling price");
      return;
    }
    if (quantity <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }

    const newItem = {
      ...selectedPart,
      selling_price: Number(customPrice),
      quantity,
      total: Number(customPrice) * quantity,
    };

    // Save the item in sessionStorage for the Billing page
    const existing = JSON.parse(sessionStorage.getItem("newBillItems") || "[]");
    existing.push(newItem);
    sessionStorage.setItem("newBillItems", JSON.stringify(existing));

    toast.success("✅ Item added successfully!");
    navigate("/billing");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b pb-3">
        <h1 className="text-2xl font-bold">➕ Add New Item</h1>
        <Button
          variant="destructive"
          onClick={() => navigate("/billing")}
          className="flex items-center gap-2"
        >
          <X className="w-4 h-4" /> Cancel
        </Button>
      </div>

      {/* Search + Dropdown */}
      <div className="relative">
        <Input
          placeholder="Search by part number or name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelectedPart(null);
          }}
          className="w-full"
        />

        {search.length > 0 && (
          <div className="absolute z-50 bg-white border rounded-md shadow-md mt-1 w-full max-h-56 overflow-auto">
            {parts
              .filter(
                (p) =>
                  p.part_number.toLowerCase().includes(search.toLowerCase()) ||
                  p.part_name.toLowerCase().includes(search.toLowerCase())
              )
              .slice(0, 10)
              .map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedPart(p);
                    setSearch(`${p.part_number} — ${p.part_name}`);
                  }}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="font-medium">{p.part_number}</div>
                  <div className="text-sm text-gray-600">{p.part_name}</div>
                  <div className="text-xs text-gray-400">
                    Stock: {p.stock_quantity} {p.unit}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Selected Part Details */}
      {selectedPart && (
        <div className="p-4 border rounded-md bg-card shadow-sm">
          <p className="font-semibold text-lg">{selectedPart.part_name}</p>
          <p className="text-sm text-gray-600 mb-3">
            Part No: {selectedPart.part_number}
          </p>

          <div className="flex flex-wrap gap-4">
            <Input
              type="number"
              placeholder="Selling Price"
              value={customPrice}
              onChange={(e) => setCustomPrice(Number(e.target.value))}
              className="w-40"
            />
            <Input
              type="number"
              placeholder="Quantity"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-40"
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Item
        </Button>
      </div>
    </div>
  );
};

export default AddItem;
