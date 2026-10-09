
export default function JsonEditor({ value, onChange }) {
  return (
    <textarea
      className="json-editor"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      spellCheck={false}
      placeholder={'{\n  "name": "New User"\n}'}
    />
  );
}
