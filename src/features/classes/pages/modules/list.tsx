import React from "react";
import { useTranslation } from "react-i18next";

const ModulesList = () => {
  const { t } = useTranslation();
  return <div className="p-8">{t("resources.modules.label")}</div>;
};

export default ModulesList;
