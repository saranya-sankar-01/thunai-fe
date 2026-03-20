import { getLocalStorageItem , requestApi } from "../Service/MeetingService";

const userInfo = getLocalStorageItem("user_info") || {};
const tenant_id = userInfo?.default_tenant_id || localStorage.getItem("tenant_id");

import { useToast } from "@/hooks/use-toast";

const AddBrain = ({ getCalls }: { getCalls: any }) => {

  const { toast } = useToast();

 const SendBrainData = async () => {

  const payload = {
    action_items: getCalls.action_items ?? [],
  added_type: getCalls.added_type ?? "recording",
  ai_title: getCalls.ai_title ?? getCalls.title ?? null,
  title: getCalls.title ?? null,
  summary: getCalls.summary ?? null,
  user_id: getCalls.user_id ?? null,
  category: getCalls.category ?? "Uncategorized",
  meeting_date: getCalls.meeting_date ?? null,
  link_type: getCalls.link_type ?? "public",
  linked_apps: getCalls.linked_apps ?? [],
  file_name: getCalls.file_name ?? null,
  cloud_storage_file_path: getCalls.cloud_storage_file_path ?? null,
  diarize_enabled: getCalls.diarize_enabled ?? false,
  invited_participants: getCalls.invited_participants ?? [],
  joined_participants: getCalls.joined_participants ?? [],
  key_points: getCalls.key_points ?? [],
  next_steps: getCalls.next_steps ?? [],
  relevant_tags: getCalls.relevant_tags ?? [],
  shared_options: getCalls.shared_options ?? "all",
  shared_share_type: getCalls.shared_share_type ?? null,
  shared_user_ids: getCalls.shared_user_ids ?? [],
  speaker_talktime: getCalls.speaker_talktime ?? [],
  status: getCalls.status ?? "done",
  synced_from: getCalls.synced_from ?? null,
  schedule_id: getCalls.schedule_id ?? null,
  schedule_unique_id: getCalls.schedule_unique_id ?? null,
  id: getCalls.id ?? null,
  Callscore_flag: true,
  Call_scores: getCalls.getCalls_scores ?? [],
  credits: getCalls.credits ?? 0,
  field_mapping_data: getCalls.field_mapping_data ?? null,
  field_download_response: getCalls.field_download_response ?? [],
  sentiment_percentage: getCalls.sentiment_percentage ?? {},
  sentiment_reasoning: getCalls.sentiment_reasoning ?? [],
  sentiment_transcription_with_timing:getCalls.sentiment_transcription_with_timing ?? [],
  transcription_with_timing:getCalls.transcription_with_timing ?? [],
  suggestion_data: getCalls.suggestion_data ?? [],
  chapters_and_topics: getCalls.chapters_and_topics ?? [],
  };

  try {
  const response = await requestApi(
    "post",
    `${tenant_id}/add-to/knowledgebase/`,
    payload,
    "authService"
  );

  if (response?.status === "success") {
    toast({
      title: "Success",
      description: response?.message || "Brain training started...",
      variant: "success",
    });
  }
}catch (err: any) {
    const errorMessage = err?.message ||
      err?.response?.message ||
      "Brain API Error!";
    toast({
    title: "Error",
    description: errorMessage,
    variant: "error",
  });
  }
};


  return (
    <>
      <button
        onClick={SendBrainData}
        className="bg-[rgb(45_47_146)] flex items-center gap-1 text-white h-[37px] rounded-lg px-1 sm:px-4 py-2 hover:opacity-90 transition cursor-pointer"
      >
        <span className="text-[#FFFFFF] text-md font-medium">Add to Brain</span>
      </button>

    </>
  );
};

export default AddBrain;
