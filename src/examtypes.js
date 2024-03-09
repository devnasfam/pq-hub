export const examTypes = [
  { value: "BIO101", label: "BIO101" },
  { value: "CHM101", label: "CHM101" },
  { value: "CSC101", label: "CSC101" },
  { value: "CSC102", label: "CSC102" },
  { value: "CSC104", label: "CSC104" },
  { value: "GST101", label: "GST101" },
  { value: "GST102", label: "GST102" },
  { value: "GST103", label: "GST103" },
  { value: "GST104", label: "GST104" },
  { value: "GST105", label: "GST105" },
  { value: "GST106", label: "GST106" },
  { value: "MAT101", label: "MAT101" },
  { value: "MAT102", label: "MAT102" },
  { value: "MAT103", label: "MAT103" },
  { value: "PHY101", label: "PHY101" },
  { value: "PHY102", label: "PHY102" },
  { value: "PHY107", label: "PHY107" },
  { value: "PHY108", label: "PHY108" },
  { value: "STA101", label: "STA101" },
  { value: "STA102", label: "STA102" },
  { value: "CSC201", label: "CSC201" },
  { value: "CSC202", label: "CSC202" },
  { value: "CSC203", label: "CSC203" },
  { value: "CSC204", label: "CSC204" },
  { value: "CSC205", label: "CSC205" },
  { value: "CSC206", label: "CSC206" },
  { value: "CSC208", label: "CSC208" },
  { value: "GST201", label: "GST201" },
  { value: "GST202", label: "GST202" },
  { value: "GST203", label: "GST203" },
  { value: "GST204", label: "GST204" },
  { value: "MAT201", label: "MAT201" },
  { value: "MAT204", label: "MAT204" },
  { value: "MAT205", label: "MAT205" },
  { value: "MAT207", label: "MAT207" },
  { value: "PHY201", label: "PHY201" },
  { value: "PHY202", label: "PHY202" },
  { value: "PHY212", label: "PHY212" },
];

let date = new Date().getFullYear();
let startDate = new Date("2014-01-01").getFullYear();
let nowYear = Number(date.toString().slice(2));
let startDateYear = Number(startDate.toString().slice(2));

export const Year = [];
for (let i = nowYear; i >= startDateYear; i--) {
  Year.push({
    value: "20" + i - 1 + "/" + "20" + i,
    label: "20" + i - 1 + "/" + "20" + i,
  });
}

export const Level = [
  { value: "100L", label: "100L" },
  { value: "200L", label: "200L" },
  { value: "300L", label: "300L" },
  { value: "400L", label: "400L" },
  { value: "500L", label: "500L" },
  { value: "600L", label: "600L" },
];
   
export const Rejects = [
  {value: "Not a Past Question", label: "Not a Past Question"},
  {value: "Invalid Material", label: "Invalid Material"},
  {value: "Low Quality Images", label: "Low Quality Images"},
  {value: "Inappropriate Content", label: "Inappropriate Content"},
]