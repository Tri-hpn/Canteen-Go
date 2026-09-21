import { useTranslation } from "../i18n";

// Component dịch đơn giản: <Trans k="login.title" />
export function Trans({ k }) {
  const { t } = useTranslation();
  return t(k);
}
