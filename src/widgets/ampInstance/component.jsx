import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";
import useSWR from "swr";

export default function AmpInstance({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data, error } = useSWR(`/api/amp/stats/${widget.ampInstanceId}`);

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block label="resources.cpu" />
        <Block label="resources.mem" />
        <Block label="resources.players" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="resources.cpu" value={t("common.percent", { value: data.cpu })} />
      <Block label="resources.mem" value={t("common.bytes", { value: data.mem * 1000000})} />
      <Block label="resources.players" value={t("common.number", { value: data.players })} />
    </Container>
  );
}
