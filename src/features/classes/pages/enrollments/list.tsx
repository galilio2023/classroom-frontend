import React from "react";
import { useTranslation } from "react-i18next";

const EnrollmentList = () => {
  const { t } = useTranslation();
  return <div className="p-8">{t("resources.enrollments.label")}</div>;
};

export default EnrollmentList;
