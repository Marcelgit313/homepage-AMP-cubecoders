import { useTranslation } from "next-i18next";
import useSWR from "swr";

export default function AmpStatus({ service, style })  {
  const { t } = useTranslation();

  const ampInstanceId = service.ampInstanceId;

  const apiUrl = `/api/amp/stats/${ampInstanceId}`;

  const {data, error } = useSWR(apiUrl);

  let statusLabel = t("docker.unknown");
  let backgroundClass = "px-1.5 py-0.5 bg-theme-500/10 dark:bg-theme-900/50";
  let colorClass = "text-black/20 dark:text-white/40 ";

  if (error) {
    statusLabel = t("docker.error");
    colorClass = "text-rose-500/80";
  } else if (data) {
    if (data.status === 10 || data.status === 20) {
      statusLabel = t("docker.running");
      colorClass = "text-emerald-500/80";
    }

    if (data.status === 0) {
      statusLabel = "idle";
      colorClass = "text-yellow-500/80";
    }

    if (data.status === 50) {
      statusLabel = "sleeping";
      colorClass = "text-blue-500/80";
    }

    if (data.status === -1) {
      statusLabel = "offline";
      colorClass = "text-rose-500/80";
    }
  }

  if (style === "dot") {
    colorClass = colorClass.replace(/text-/g, "bg-").replace(/\/\d\d/g, "");
    backgroundClass = "p-4 hover:bg-theme-500/10 dark:hover:bg-theme-900/20";
  }

  return (
    <div
      className={`w-auto text-center overflow-hidden ${backgroundClass} rounded-b-[3px] ampStatus ampStatus-${statusLabel
        .toLowerCase()
        .replace(" ", "-")}`}
      title={statusLabel}
    >
      {style !== "dot" ? (
        <div className={`text-[8px] font-bold ${colorClass} uppercase`}>{statusLabel}</div>
      ) : (
        <div className={`rounded-full h-3 w-3 ${colorClass}`} />
      )}
    </div>
  );
}
