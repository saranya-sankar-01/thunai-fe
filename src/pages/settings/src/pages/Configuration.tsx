import React, { useState } from "react"

import PageTitle from "../components/PageTitle";
import ConfigurationTab from "../components/ConfigurationTabButton";
import ApiConfigurationTab from "../components/ApiConfigurationTab";
import StreamingTab from "../components/StreamingTab";

const Configuration: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<"API Configuration" | "Streaming">("API Configuration");

  return (
    <div>
      <PageTitle title="Configuration" />
      <hr />
      <div className="flex gap-4 mt-4">
        <ConfigurationTab title="API Configuration" selectedTab={selectedTab} onClick={setSelectedTab} />
        <ConfigurationTab title="Streaming" selectedTab={selectedTab} onClick={setSelectedTab} />
      </div>
      {selectedTab === "API Configuration" ? <ApiConfigurationTab /> : <StreamingTab />}
    </div>
  )
}

export default Configuration