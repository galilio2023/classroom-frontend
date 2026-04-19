import React from "react";
import { useTranslation } from "react-i18next";

const CreateBadge = () => {
  const { t } = useTranslation();
  return <div className="p-8">{t("resources.badges.label")}</div>;
};

export default CreateBadge;
