import { StatementUpload } from "../StatementUpload";

export default function StatementUploadExample() {
  return (
    <StatementUpload
      onUploadComplete={(text, fileName) => {
        console.log("File uploaded:", fileName);
        console.log("Content preview:", text.substring(0, 200));
      }}
    />
  );
}
