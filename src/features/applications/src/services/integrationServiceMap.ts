import {useAsanaService} from "../store/asanaStore";
import {useGithubService} from "../store/githubStore"
import { useHelpscoutService } from "../store/helpscoutStore";
import {useJiraService} from "../store/jiraStore"
import { useSlackStore } from "../store/slackStore";
import { useTeamsStore } from "../store/teamStore";

export const integrationServiceMap: Record<string, any>={
    asana: useAsanaService,
    github_issues: useGithubService,
    jira: useJiraService,
    helpscout: useHelpscoutService,
    microsoft_teams: useTeamsStore,
    slack: useSlackStore
} as const;