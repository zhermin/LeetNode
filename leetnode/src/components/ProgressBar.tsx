const ProgressBar = ({ progress }) => {
  return (
    <div className="relative pt-10">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <span className="text-s inline-block rounded-full bg-cyan-200 py-1 px-2 font-semibold uppercase text-cyan-600">
            Mastery
          </span>
        </div>
        <div className="text-right">
          <span className="text-s inline-block font-semibold text-cyan-600">
            30%
          </span>
        </div>
      </div>
      <div className="mb-4 flex h-2.5 overflow-hidden rounded bg-cyan-200">
        <div
          style={{ width: "60%" }}
          className="flex flex-col justify-center whitespace-nowrap bg-cyan-500 text-center text-white shadow-none"
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
