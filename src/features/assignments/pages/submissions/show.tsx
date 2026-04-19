import React from "react";
import { useTranslation } from "react-i18next";

const SubmissionShow = () => {
  const { t } = useTranslation();
  return <div className="p-8">{t("resources.submissions.label")}</div>;
};

export default SubmissionShow;
