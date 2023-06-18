const DateDiff = {
  inSeconds: function (
    d1: { getTime: () => number },
    d2: { getTime: () => number }
  ) {
    const t2 = d2.getTime();
    const t1 = d1.getTime();

    return (t2 - t1) / 1000;
  },

  inMinutes: function (
    d1: { getTime: () => number },
    d2: { getTime: () => number }
  ) {
    const t2 = d2.getTime();
    const t1 = d1.getTime();

    return (t2 - t1) / 60000;
  },

  inHours: function (
    d1: { getTime: () => number },
    d2: { getTime: () => number }
  ) {
    const t2 = d2.getTime();
    const t1 = d1.getTime();

    return (t2 - t1) / 3600000;
  },

  inDays: function (
    d1: { getTime: () => number },
    d2: { getTime: () => number }
  ) {
    const t2 = d2.getTime();
    const t1 = d1.getTime();

    return (t2 - t1) / (24 * 3600 * 1000);
  },

  inWeeks: function (
    d1: { getTime: () => number },
    d2: { getTime: () => number }
  ) {
    const t2 = d2.getTime();
    const t1 = d1.getTime();

    return (t2 - t1) / (24 * 3600 * 1000 * 7);
  },

  inMonths: function (
    d1: { getFullYear: () => number; getMonth: () => number },
    d2: { getFullYear: () => number; getMonth: () => number }
  ) {
    const d1Y = d1.getFullYear();
    const d2Y = d2.getFullYear();
    const d1M = d1.getMonth();
    const d2M = d2.getMonth();

    return d2M + 12 * d2Y - (d1M + 12 * d1Y);
  },

  inYears: function (
    d1: { getFullYear: () => number },
    d2: { getFullYear: () => number }
  ) {
    return d2.getFullYear() - d1.getFullYear();
  },
};

export function DateDiffCalc(comparedDate: Date) {
  if (
    Math.round(
      DateDiff.inMinutes(new Date(comparedDate as Date), new Date())
    ) === 1 ||
    Math.round(
      DateDiff.inMinutes(new Date(comparedDate as Date), new Date())
    ) === 0
  ) {
    return (
      Math.round(
        DateDiff.inMinutes(new Date(comparedDate as Date), new Date())
      ) + " minute ago"
    );
  } else if (
    DateDiff.inMinutes(new Date(comparedDate as Date), new Date()) < 60
  ) {
    return (
      Math.round(
        DateDiff.inMinutes(new Date(comparedDate as Date), new Date())
      ) + " minutes ago"
    );
  } else if (
    Math.round(DateDiff.inHours(new Date(comparedDate as Date), new Date())) ===
    1
  ) {
    return "1 hour ago";
  } else if (
    DateDiff.inHours(new Date(comparedDate as Date), new Date()) < 24
  ) {
    return (
      Math.round(DateDiff.inHours(new Date(comparedDate as Date), new Date())) +
      " hours ago"
    );
  } else if (
    Math.round(DateDiff.inDays(new Date(comparedDate as Date), new Date())) ===
    1
  ) {
    return "1 day ago";
  } else if (DateDiff.inDays(new Date(comparedDate as Date), new Date()) < 7) {
    return (
      Math.round(DateDiff.inDays(new Date(comparedDate as Date), new Date())) +
      " days ago"
    );
  } else if (
    Math.round(DateDiff.inWeeks(new Date(comparedDate as Date), new Date())) ===
    1
  ) {
    return "1 week ago";
  } else if (DateDiff.inWeeks(new Date(comparedDate as Date), new Date()) < 4) {
    return (
      Math.round(DateDiff.inWeeks(new Date(comparedDate as Date), new Date())) +
      " weeks ago"
    );
  } else if (
    Math.round(
      DateDiff.inMonths(new Date(comparedDate as Date), new Date())
    ) === 1
  ) {
    return "1 month ago";
  } else if (
    DateDiff.inMonths(new Date(comparedDate as Date), new Date()) < 12
  ) {
    return (
      Math.round(
        DateDiff.inMonths(new Date(comparedDate as Date), new Date())
      ) + " months ago"
    );
  } else if (
    Math.round(
      DateDiff.inMonths(new Date(comparedDate as Date), new Date())
    ) === 1
  ) {
    return "1 year ago";
  } else {
    return (
      Math.round(DateDiff.inYears(new Date(comparedDate as Date), new Date())) +
      " years ago"
    );
  }
}
