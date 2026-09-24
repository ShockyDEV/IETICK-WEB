/**
 * Respeta la grafía de la marca «ieTIC» dentro de textos en versalitas o
 * mayúsculas (los antetítulos usan `uppercase`, que la convertiría en «IETIC»).
 */
export function BrandText({ children }: { children: string }) {
  const parts = children.split(/(ieTIC)/g);
  return (
    <>
      {parts.map((part, i) =>
        part === "ieTIC" ? (
          <span key={i} className="normal-case">
            ieTIC
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}
