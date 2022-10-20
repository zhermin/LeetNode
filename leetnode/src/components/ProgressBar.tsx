import axios from "axios";

const ProgressBar = ({ topicSlug, userId, topicName }: any) => {
  //get mastery level to be display on page
  const displayMastery = async (topicSlug: any) => {
    const fetchMastery = async (request: { id: string; topicSlug: string }) => {
      try {
        //update mastery of student
        const res = await axios.post(
          "http://localhost:3000/api/pybkt/get",
          request //assume correct
        ); //use data destructuring to get data from the promise object
        return res.data;
      } catch (error) {
        console.log(error);
      }
    };

    const progressData = await fetchMastery({
      id: userId,
      topicSlug: topicSlug,
    });
    console.log(progressData); //check output (should return mastery level for each of the topics in course)
  };

  return (
    <div className="relative pt-10">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <span className="text-s inline-block rounded-full bg-cyan-200 py-1 px-2 font-semibold uppercase text-cyan-600">
            {topicName}
          </span>
        </div>
        <div className="text-right">
          <span className="text-s inline-block font-semibold text-cyan-600">
            60.50%
          </span>
        </div>
      </div>
      <div className="mb-4 flex h-2.5 overflow-hidden rounded bg-cyan-200">
        <div
          // if want percentage for css, do in **.** format
          style={{ width: "60.50%" }}
          className="flex flex-col justify-center whitespace-nowrap bg-cyan-500 text-center text-white shadow-none"
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
