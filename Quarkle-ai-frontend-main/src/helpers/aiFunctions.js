import mixpanel from "mixpanel-browser";

export function AiReport(getAccessTokenSilently, chapterId, chapters, setReportElems, setIsReportLoading, plumeAPI, saveData) {
  mixpanel.track("AI Report Triggered");
  saveData(chapters)
    .then((r) => {
      getAccessTokenSilently().then((token) => {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          timeout: 120000,
        };

        plumeAPI
          .get("/critique_api/analyze/" + chapterId, config)
          .then(function (response) {
            const newReportElems = [
              {
                id: "summary",
                title: "Summary",
                content: response.data["summary"],
              },
              {
                id: "criticism",
                title: "Constructive Criticism",
                content: response.data["criticism"],
              },
              {
                id: "strengths",
                title: "Strengths",
                content: [response.data["strength1"], response.data["strength2"], response.data["strength3"]],
              },
              {
                id: "improvement",
                title: "Areas of Improvement",
                content: [response.data["aoi1"], response.data["aoi2"], response.data["aoi3"]],
              },
            ];
            setReportElems(newReportElems);
            setIsReportLoading(false);
          })
          .catch(function (error) {
            setIsReportLoading(false);
          });
      });
    })
    .catch((e) => {
      setIsReportLoading(false);
    });
}
