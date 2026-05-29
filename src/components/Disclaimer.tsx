import { ShieldAlert } from "lucide-react";

export default function Disclaimer() {
  return (
    <div className="w-full bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left text-xs text-gray-500">
          <ShieldAlert className="w-6 h-6 text-gray-400 shrink-0 mx-auto sm:mx-0" />
          <div className="space-y-1">
            <p>
              <strong className="text-gray-700 font-medium">Medical Disclaimer:</strong> HealthLens AI provides educational health explanations and triage suggestions only. It does not provide diagnosis, treatment, or medical decisions. Please consult a licensed clinician for medical concerns.
            </p>
            <p>
              本产品仅提供健康科普与导诊参考，不构成诊断、治疗或用药建议。如有不适或指标明显异常，请咨询专业医生。
            </p>
            <p className="pt-2 text-gray-400">
              © {new Date().getFullYear()} HealthLens AI Demo. For demonstration purposes only. Data is mocked and not sent to actual medical providers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
