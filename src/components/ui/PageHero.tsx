import type { ReactNode } from "react";

export default function PageHero({
  eyebrow,
  title,
  accent,
  children,
  tone = "default",
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  children?: ReactNode;
  tone?: "default" | "solar";
}) {
  const bg =
    tone === "solar"
      ? "bg-[linear-gradient(90deg,#18211e,#21352c_60%,#384631)]"
      : "bg-[linear-gradient(90deg,#1b1f26_0%,#262b33_55%,#394149_100%)]";
  return (
    <section className={`${bg} grid-lines border-b border-[#303742] py-20`}>
      <div className="container-site">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-5 max-w-3xl text-4xl leading-none font-extrabold tracking-tight uppercase sm:text-5xl">
          {title} {accent && <span className={tone === "solar" ? "text-solar" : "text-gradient"}>{accent}</span>}
        </h1>
        {children && <div className="mt-5 max-w-2xl text-lg text-[#c3c9d3]">{children}</div>}
      </div>
    </section>
  );
}
