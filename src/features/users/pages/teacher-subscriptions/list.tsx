import React from "react";
import { useTranslation } from "react-i18next";

const TeacherSubscriptionsList = () => {
  const { t } = useTranslation();
  return <div className="p-8">{t("resources.teacher-subscriptions.label")}</div>;
};

export default TeacherSubscriptionsList;
