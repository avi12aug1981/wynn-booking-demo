export default function ButtonLoader() {
  return (
    <span className="btn-loader" role="status" aria-label="Loading">
      <span className="btn-loader-ring" />
      <span className="btn-loader-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    </span>
  );
}
