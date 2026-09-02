// A banner shown on every page, so nobody mistakes this demo for a real
// emergency warning system. The exact wording is required by the project brief.
export default function PrototypeNotice() {
  return (
    <div className="bg-amber-50 border border-amber-300 text-amber-900 text-sm md:text-base rounded-lg px-4 py-3 mb-6">
      <strong>Prototype only:</strong> risk values are based on sample data and
      rule-based assessment. This is not an official emergency warning service.
    </div>
  )
}
