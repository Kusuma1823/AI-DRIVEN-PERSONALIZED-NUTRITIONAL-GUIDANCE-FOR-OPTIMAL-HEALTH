import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Routes } from "react-router-dom";
import { Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { LandingPage } from "../pages/landing/LandingPage";
import { HomeDashboardPage } from "../pages/home/HomeDashboardPage";
import { RecommendationAnalysisPage } from "../pages/recommendation/RecommendationAnalysisPage";
import { FoodRecommendationPage } from "../pages/recommendation/FoodRecommendationPage";
import { FoodDetailsPage } from "../pages/foods/FoodDetailsPage";
import { HealthRiskAnalysisPage } from "../pages/analysis/HealthRiskAnalysisPage";
import { UserProfilePage } from "../pages/profile/UserProfilePage";
import { CommunityPage } from "../pages/community/CommunityPage";
import { ContactUsPage } from "../pages/contact/ContactUsPage";
import { ComplaintFeedbackPage } from "../pages/feedback/ComplaintFeedbackPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { SignupPage } from "../pages/auth/SignupPage";
import { useSession } from "./useSession";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { SavedFoodsPage } from "../pages/savedFoods/SavedFoodsPage";
import { APITestPage } from "../pages/APITestPage";

function RequireAuth(props: { children: React.ReactElement }) {
  const session = useSession();
  if (!session) return <Navigate to="/login" replace />;
  return props.children;
}

function PublicOnly(props: { children: React.ReactElement }) {
  const session = useSession();
  if (session) return <Navigate to="/home" replace />;
  return props.children;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicOnly><LoginPage /></PublicOnly>} />
        <Route
          path="/home"
          element={
            <RequireAuth>
              <HomeDashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/analysis/:foodId"
          element={
            <RequireAuth>
              <RecommendationAnalysisPage />
            </RequireAuth>
          }
        />
        <Route
          path="/recommend"
          element={
            <RequireAuth>
              <FoodRecommendationPage />
            </RequireAuth>
          }
        />
        <Route
          path="/food/:foodId"
          element={
            <RequireAuth>
              <FoodDetailsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/health-risk/:foodId"
          element={
            <RequireAuth>
              <HealthRiskAnalysisPage />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <UserProfilePage />
            </RequireAuth>
          }
        />
        <Route
          path="/community"
          element={
            <RequireAuth>
              <CommunityPage />
            </RequireAuth>
          }
        />
        <Route
          path="/contact"
          element={
            <RequireAuth>
              <ContactUsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/feedback"
          element={
            <RequireAuth>
              <ComplaintFeedbackPage />
            </RequireAuth>
          }
        />

        <Route
          path="/saved-foods"
          element={
            <RequireAuth>
              <SavedFoodsPage />
            </RequireAuth>
          }
        />

        <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
        <Route path="/signup" element={<PublicOnly><SignupPage /></PublicOnly>} />

        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminDashboardPage />
            </RequireAuth>
          }
        />

        <Route
          path="/test-api"
          element={<APITestPage />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

