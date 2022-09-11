import blog, { ga, redirects } from "https://deno.land/x/blog@0.3.3/blog.tsx";
import "https://esm.sh/prismjs@1.27.0/components/prism-typescript?no-check";
import "https://esm.sh/prismjs@1.27.0/components/prism-haskell?no-check";
import "https://esm.sh/prismjs@1.27.0/components/prism-bash?no-check";
import "https://esm.sh/prismjs@1.27.0/components/prism-rust?no-check";
import "https://esm.sh/prismjs@1.27.0/components/prism-python?no-check";
import "https://esm.sh/prismjs@1.27.0/components/prism-agda?no-check";

blog({
  title: "Joona Piirainen",
  author: "Joona Piirainen",
  avatar: "./jp.jpg",
  avatarClass: "rounded-full",
  links: [
    { title: "Email", url: "mailto:joona.piirainen@gmail.org" },
    { title: "GitHub", url: "https://github.com/japiirainen" },
  ],
  background: "#f9f9f9",
  middlewares: [
    ga("G-JRBVDPJMXR"),
    redirects({
      "iocp-links.html": "iocp_links",
      "rant.html": "rant",
    }),
  ],
});
