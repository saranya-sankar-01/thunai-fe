export const groupMeetingsByDate = (data: any[]) => {
  const groups: Record<string, any[]> = {};

  const today = new Date();
  
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const lastWeekStart = new Date(today);
  lastWeekStart.setDate(today.getDate() - 7);

  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay());

  const nextWeekStart = new Date(today);
  nextWeekStart.setDate(today.getDate() + 7);
  nextWeekStart.setHours(0, 0, 0, 0);

  const nextWeekEnd = new Date(nextWeekStart);
  nextWeekEnd.setDate(nextWeekStart.getDate() + 7);
  nextWeekEnd.setHours(23, 59, 59, 999);

  data.forEach((agent) => {
    const dateString = agent.schedule?.start || agent.start || agent.created;
    
    if (!dateString) {
      groups["No Date"] = groups["No Date"] || [];
      groups["No Date"].push(agent);
      return;
    }

    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      groups["Invalid Date"] = groups["Invalid Date"] || [];
      groups["Invalid Date"].push(agent);
      return;
    }

    date.setHours(0, 0, 0, 0);

    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Past dates
    if (date.getTime() === yesterday.getTime()) {
      groups["Yesterday"] = groups["Yesterday"] || [];
      groups["Yesterday"].push(agent);
    } else if (date < today && date >= lastWeekStart) {
      groups["Last Week"] = groups["Last Week"] || [];
      groups["Last Week"].push(agent);
    } else if (date < lastWeekStart) {
      groups["Older"] = groups["Older"] || [];
      groups["Older"].push(agent);
    }
    // Future dates
    else if (date.getTime() === today.getTime()) {
      groups["Today"] = groups["Today"] || [];
      groups["Today"].push(agent);
    } else if (date.getTime() === tomorrow.getTime()) {
      groups["Tomorrow"] = groups["Tomorrow"] || [];
      groups["Tomorrow"].push(agent);
    } else if (date > tomorrow && diffDays <= 7) {
      groups["This Week"] = groups["This Week"] || [];
      groups["This Week"].push(agent);
    } else if (date > today && diffDays <= 14) {
      groups["Next Week"] = groups["Next Week"] || [];
      groups["Next Week"].push(agent);
    } else {
      groups["Later"] = groups["Later"] || [];
      groups["Later"].push(agent);
    }
  });

  // Remove empty groups and sort by chronological order
  const orderedGroups: Record<string, any[]> = {};
  
  // Define the desired order
  const groupOrder = [
    "Today",
    "Tomorrow", 
    "This Week",
    "Next Week",
    "Yesterday",
    "Last Week",
    "Older",
    "Later",
    "No Date",
    "Invalid Date"
  ];

  groupOrder.forEach(group => {
    if (groups[group] && groups[group].length > 0) {
      orderedGroups[group] = groups[group];
    }
  });

  return orderedGroups;
};