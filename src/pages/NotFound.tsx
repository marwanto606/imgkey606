import { useSEO } from "@/hooks/use-seo";

const NotFound = () => {

  // SEO Configuration
  useSEO({
    title: "404 - Page Not Found | ImgKey606",
    description: "Sorry, the page you are looking for could not be found. Return to ImgKey606 to discover amazing stock images and AI-powered tools.",
    keywords: "404, page not found, error page, ImgKey606",
    canonical: "https://imgkey.lovable.app/404"
  });


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
