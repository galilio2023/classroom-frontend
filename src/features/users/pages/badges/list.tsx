import React from "react";
import { useTranslation } from "react-i18next";

const BadgesList = () => {
  const { t } = useTranslation();
  return <div className="p-8">{t("resources.badges.label")}</div>;
};

export default BadgesList;
