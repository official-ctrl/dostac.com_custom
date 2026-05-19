import { createRoot } from "react-dom/client";
import {
  getListPublicCategoryTranslationsQueryOptions,
  getListPublicSubCategoryTranslationsQueryOptions,
} from "@workspace/api-client-react";
import { queryClient } from "./App";
import App from "./App";
import "./index.css";

async function bootstrap() {
  await Promise.all([
    queryClient.prefetchQuery(getListPublicCategoryTranslationsQueryOptions()),
    queryClient.prefetchQuery(
      getListPublicSubCategoryTranslationsQueryOptions(),
    ),
  ]);
  createRoot(document.getElementById("root")!).render(<App />);
}

bootstrap();
