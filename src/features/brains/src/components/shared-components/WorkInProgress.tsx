// components/WorkInProgress.jsx
import { Construction } from "lucide-react";

export default function WorkInProgress({ message = "We’re currently working on this feature. Check back soon!",  height = "80vh"}) {
  return (
    <div className="flex flex-col items-center justify-center "  style={{ height }}>
      <h2 className="text-xl font-bold mb-2">Work in Progress</h2>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}
