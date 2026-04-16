import React from "react";
import { useTranslation } from "react-i18next";

const ResourcesList = () => {
  const { t } = useTranslation();
  return <div className="p-8">{t("resources.resources.label")}</div>;
};

export default ResourcesList;
