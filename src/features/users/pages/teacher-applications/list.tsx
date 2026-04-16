import React from "react";
import { useTranslation } from "react-i18next";

const TeacherApplicationsList = () => {
  const { t } = useTranslation();
  return <div className="p-8">{t("resources.teacher-applications.label")}</div>;
};

export default TeacherApplicationsList;
