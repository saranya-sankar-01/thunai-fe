const url = new URL(window.location.href); // or use your URL string
const token = url.searchParams.get("token");
const tenant_id = url.searchParams.get("tenant_id");
const csrf_token = url.searchParams.get("csrf_token");
const API_ENDPOINT =  window['env']['API_ENDPOINT'];

const API_BASE =
  `${API_ENDPOINT}/account-service/ai/api/v1/${tenant_id}`;
// const token =
//   "eyJhbGciOiJSUzI1NiIsImtpZCI6IjY2ZGIxMjJhNjQ2ZTg3ZGY4ZTJlNjE0OCJ9.eyJpc3MiOiJodHRwczovL3VuaWZlZC1hcGkuaW5maXNpZ24ubmV0L3VuaWZlZC1hdXRoLXNlcnZpY2UvdW5pZmVkL2luZmlzaWdudW5pZmVkMTcyNTYyNzg3Mi9tYWdpYy9hdXRoLyIsInN1YiI6IjY3NWJjYmY0MDg4N2UyOTg1NmM1Y2M2ZiIsImF1ZCI6ImluZmlzaWdudW5pZmVkMTcyNTYyNzg3MiIsImV4cCI6MTc1Mzg1NTY2MiwiaWF0IjoxNzUyNjQ2MDYyLCJzdGF0ZSI6ImVlMGRkMzAyLTgxYjMtNDYxMy1hNzIwLWY3MDNkZTg5ODY5NSIsInVzZXJfaWQiOiI2NzViY2JmNDA4ODdlMjk4NTZjNWNjNmYiLCJlbWFpbF9pZCI6ImplYmFzdGluQGVudHJhbnMuaW8iLCJ1c2VyX25hbWUiOiJKZWJhc3RpbiIsInR5cGUiOiJwYXNzd29yZCIsInVzZXJfdHlwZSI6ImRpcmVjdCIsInRyYW5zYWN0aW9uX2lkIjoiMDQ1YWFkOGQtOWI0NC00OTM0LWEwYzAtZDJmYjFlMDdiNjVkIiwiZW1haWxJZCI6ImplYmFzdGluQGVudHJhbnMuaW8iLCJnaXZlbk5hbWUiOiJKZWJhc3RpbiIsInVzZXJSb2xlIjpudWxsfQ.KgwE94Y2vETH9sBdspsFVKs6RZ9bSFBRBdlVhmuJFEgSz3EzgksxO9Paquyb5nNoloPGmKR23qj10IIN99x4hLOwYgvhbxvJE_tja3dHjYa03-I8NKgoH4uaK-cpslP6JRUWN8oynnUdC3IYbM-W_ZjM42kJDPmUoULcQ4XW4UgsZ9a-PXisL1sKJCwyfL9f8Qdb2FlYP5PK8O7PSpSMO2OcwjpHMvAKYE408tl14uKV2HisnQzqIDUcz33YCi_5VTWemLOPBcgbxisX9Mms--cDnfKeEcQNgP_FBpzKvjQxSAFw-IDv5hwPPLAivAWqg2NYVpfpkpE_MhWVWQlyOA"; // Replace with your actual token

  interface RequestOptions extends RequestInit {
  devicetype?: string;
}

export const apiRequest = async (
  path: string,
  options: RequestOptions = {}
) => {
  const { devicetype, ...rest } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...rest.headers,
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (devicetype) headers["devicetype"] = csrf_token;

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API ${path} failed: ${response.status} - ${errorText}`);
  }

  return response.json();
};


export const storageAnalysis = async () => {
  const url = `${API_ENDPOINT}/account-service/ai/api/v1/storage/analysis/`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
         "Authorization": `Bearer ${token}`,
         "devicetype": csrf_token
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching storage analysis:", error);
    return null;
  }
};