import EstimateForm from "@/components/EstimateForm";

export default function NewEstimatePage() {
  return (
    <div className="py-4">
      <div className="flex justify-between items-center mb-8 no-print">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tight">Create New Estimate</h1>
          <p className="text-gray-500 font-medium">Bhumika Tiles & Building Material</p>
        </div>
      </div>
      <EstimateForm />
    </div>
  );
}
