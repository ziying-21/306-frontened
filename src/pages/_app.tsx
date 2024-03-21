import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LoginScreen from ".";
import NotFound from "@/components/NotFound";
import "@/styles/globals.css";
import MyLayout from "@/layouts/layout";
import store from "@/store";
import { Provider } from "react-redux";

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    if (localStorage.getItem("role")) {
      setRole(localStorage.getItem("role"));
    }
  }, [router]);
  if (!router.isReady) {
    return;
  }
  if (
    router.pathname.startsWith("/demander/") ||
    router.pathname.startsWith("/labeler/") ||
    router.pathname.startsWith("/administrator/") ||
    router.pathname.startsWith("/agent/")
  ) {
    return (
      <Provider store={store}>
        <MyLayout role={role}>
          <Component {...pageProps} />
        </MyLayout>
      </Provider>
    );
  } else if (router.pathname === "/") {
    // login
    return (
      <Provider store={store}>
        <LoginScreen setRole={setRole} />
      </Provider>
    );
  } else {
    // other interface
    return (
      <Provider store={store}>
        <NotFound />
      </Provider>
    );
  }
};

export default App;
