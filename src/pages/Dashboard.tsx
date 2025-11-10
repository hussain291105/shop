import React, { useState } from "react";
import { Plus, AlertTriangle, Pencil, Trash2, X } from "lucide-react";

interface SparePart {
  partNumber: string;
  partName: string;
  category: string;
  manufacturer: string;
  stock: number;
  minStock: number;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  location: string;
}

const Dashboard: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [spareParts, setSpareParts] = useState<SparePart[]>([
    {
      partNumber: "bg-2002",
      partName: "Ring",
      category: "Ring",
      manufacturer: "TP",
      stock: 20,
      minStock: 5,
      unit: "piece",
      costPrice: 50,
      sellingPrice: 85,
      location: "Shop",
    },
    {
      partNumber: "bh-2002",
      partName: "Piston 2021",
      category: "Piston",
      manufacturer: "Teikin",
      stock: 100,
      minStock: 10,
      unit: "piece",
      costPrice: 70,
      sellingPrice: 90,
      location: "Warehouse",
    },
  ]);

  const [formData, setFormData] = useState({
    partNumber: "",
    partName: "",
    category: "",
    manufacturer: "",
    stock: "",
    minStock: "",
    unit: "piece",
    costPrice: "",
    sellingPrice: "",
    location: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setFormData({
      partNumber: "",
      partName: "",
      category: "",
      manufacturer: "",
      stock: "",
      minStock: "",
      unit: "piece",
      costPrice: "",
      sellingPrice: "",
      location: "",
    });
    setEditingIndex(null);
    setIsModalOpen(true);
  };

  const handleAddOrEditPart = (e: React.FormEvent) => {
    e.preventDefault();

    const newPart: SparePart = {
      partNumber: formData.partNumber,
      partName: formData.partName,
      category: formData.category,
      manufacturer: formData.manufacturer || "-",
      stock: parseFloat(formData.stock) || 0,
      minStock: parseFloat(formData.minStock) || 0,
      unit: formData.unit || "piece",
      costPrice: parseFloat(formData.costPrice) || 0,
      sellingPrice: parseFloat(formData.sellingPrice) || 0,
      location: formData.location || "-",
    };

    if (editingIndex !== null) {
      // Update existing
      const updated = [...spareParts];
      updated[editingIndex] = newPart;
      setSpareParts(updated);
    } else {
      // Add new
      setSpareParts((prev) => [...prev, newPart]);
    }

    setIsModalOpen(false);
    setEditingIndex(null);
  };

  const handleEdit = (index: number) => {
    const part = spareParts[index];
    setFormData({
      partNumber: part.partNumber,
      partName: part.partName,
      category: part.category,
      manufacturer: part.manufacturer,
      stock: String(part.stock),
      minStock: String(part.minStock),
      unit: part.unit,
      costPrice: String(part.costPrice),
      sellingPrice: String(part.sellingPrice),
      location: part.location,
    });
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const handleDelete = (index: number) => {
    if (window.confirm("Are you sure you want to delete this part?")) {
      setSpareParts((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Stats Calculations
  const totalParts = spareParts.length;
  const inventoryValue = spareParts.reduce(
    (acc, part) => acc + part.stock * part.costPrice,
    0
  );
  const averagePrice =
    spareParts.length > 0
      ? spareParts.reduce((acc, part) => acc + part.sellingPrice, 0) /
        spareParts.length
      : 0;
  const lowStockCount = spareParts.filter(
    (part) => part.stock < part.minStock
  ).length;

  const lowStockItems = spareParts.filter((part) => part.stock < part.minStock);
  
  return (
    <div className="p-6 space-y-10">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm border w-[600px] h-[300px] mx-auto text-center py-10 px-8">
        <img
          src="/logo.png"
          alt="Ezzy Auto Parts"
          className="mx-auto h-20 mb-4 object-contain"
        />
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome to Ezzy Auto Parts
        </h1>
        <p className="text-gray-600 mt-1 text-base">
          Reliable spare parts for every vehicle — quality you can trust.
        </p>
      </div>

      {/* Inventory Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          AutoParts Inventory
        </h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          <Plus size={18} /> Add New Part
        </button>
      </div>

      {/* Inventory Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-sm font-medium text-gray-600">Total Parts</h3>
          <p className="text-3xl font-bold mt-2 text-gray-900">{totalParts}</p>
          <p className="text-gray-500 text-sm mt-1">Active spare parts</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-sm font-medium text-gray-600">Inventory Value</h3>
          <p className="text-3xl font-bold mt-2 text-gray-900">
            ₹{inventoryValue.toFixed(2)}
          </p>
          <p className="text-gray-500 text-sm mt-1">Total stock value</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-sm font-medium text-gray-600">Average Price</h3>
          <p className="text-3xl font-bold mt-2 text-gray-900">
            ₹{averagePrice.toFixed(2)}
          </p>
          <p className="text-gray-500 text-sm mt-1">Per part average</p>
        </div>

        <div
        onClick={() => lowStockItems.length > 0 && setIsLowStockModalOpen(true)}
        className={`bg-white rounded-2xl p-6 shadow-sm border cursor-pointer transition ${
          lowStockItems.length > 0 ? "hover:shadow-md" : "opacity-70"
          }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Low Stock Alert</h3>
              <AlertTriangle className="text-yellow-500" size={20} />
              </div>
              <p className="text-3xl font-bold mt-2 text-gray-900">
                {lowStockItems.length}
                </p>
                <p className="text-gray-500 text-sm mt-1">Items need reorder</p>
                </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">
              Low Stock Alert
            </h3>
            <AlertTriangle className="text-yellow-500" size={20} />
          </div>
          <p className="text-3xl font-bold mt-2 text-gray-900">
            {lowStockCount}
          </p>
          <p className="text-gray-500 text-sm mt-1">Items need reorder</p>
        </div>
      </section>

      {/* Table Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">All Spare Parts</h2>

        <input
          type="text"
          placeholder="Search by name, part number, or category..."
          className="w-full md:w-1/3 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
        />

        <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="p-3 border-b text-sm font-medium">Part Number</th>
                <th className="p-3 border-b text-sm font-medium">Part Name</th>
                <th className="p-3 border-b text-sm font-medium">Category</th>
                <th className="p-3 border-b text-sm font-medium">Manufacturer</th>
                <th className="p-3 border-b text-sm font-medium">Stock</th>
                <th className="p-3 border-b text-sm font-medium">Cost Price</th>
                <th className="p-3 border-b text-sm font-medium">Selling Price</th>
                <th className="p-3 border-b text-sm font-medium">Location</th>
                <th className="p-3 border-b text-center text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="text-gray-800 text-sm">
              {spareParts.map((part, index) => (
                <tr key={index} className="hover:bg-gray-50 transition">
                  <td className="p-3 border-b">{part.partNumber}</td>
                  <td className="p-3 border-b font-medium">{part.partName}</td>
                  <td className="p-3 border-b">
                    <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                      {part.category}
                    </span>
                  </td>
                  <td className="p-3 border-b">{part.manufacturer}</td>
                  <td
                    className={`p-3 border-b font-semibold ${
                      part.stock < part.minStock
                        ? "text-red-600"
                        : "text-gray-800"
                    }`}
                  >
                    {part.stock} {part.unit}
                  </td>
                  <td className="p-3 border-b">₹{part.costPrice.toFixed(2)}</td>
                  <td className="p-3 border-b">₹{part.sellingPrice.toFixed(2)}</td>
                  <td className="p-3 border-b">{part.location}</td>
                  <td className="p-3 border-b flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(index)}
                      className="p-2 rounded hover:bg-gray-100 transition"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="p-2 rounded hover:bg-gray-100 transition text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsModalOpen(false)}
          ></div>

          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl p-6 relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>

              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                {editingIndex !== null ? "Edit Spare Part" : "Add New Spare Part"}
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Enter the details of the automotive spare part.
              </p>

              <form onSubmit={handleAddOrEditPart} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Part Number *
                    </label>
                    <input
                      name="partNumber"
                      value={formData.partNumber}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Part Name *
                    </label>
                    <input
                      name="partName"
                      value={formData.partName}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Category *
                    </label>
                    <input
                      name="category"
                      placeholder="e.g., Engine, Brake System"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Manufacturer
                    </label>
                    <input
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Stock Quantity *
                    </label>
                    <input
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Min. Stock
                    </label>
                    <input
                      name="minStock"
                      value={formData.minStock}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Unit</label>
                    <input
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Selling Price *
                    </label>
                    <input
                      name="sellingPrice"
                      value={formData.sellingPrice}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Cost Price
                    </label>
                    <input
                      name="costPrice"
                      value={formData.costPrice}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Storage Location
                  </label>
                  <input
                    name="location"
                    placeholder="e.g., Warehouse A, Shelf 3"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
                  >
                    {editingIndex !== null ? "Update Part" : "Add Part"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
