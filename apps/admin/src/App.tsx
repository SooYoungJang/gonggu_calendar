import { Admin, Resource, ListGuesser } from "react-admin";
import { dataProvider } from "@/providers/dataProvider";
import { authProvider } from "@/providers/authProvider";
import { Dashboard } from "@/pages/Dashboard";
import {
  SubmissionList,
  SubmissionShow,
  SubmissionEdit,
  SubmissionCreate,
} from "@/pages/SubmissionsList";
import { UserList, UserShow, UserEdit } from "@/pages/UsersList";
import {
  GroupBuyList,
  GroupBuyShow,
  GroupBuyEdit,
  GroupBuyCreate,
} from "@/pages/GroupBuysList";

export function App() {
  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      dashboard={Dashboard}
      requireAuth
    >
      <Resource
        name="gonggu_submissions"
        options={{ label: "Submissions" }}
        list={SubmissionList}
        show={SubmissionShow}
        edit={SubmissionEdit}
        create={SubmissionCreate}
      />
      <Resource
        name="users"
        options={{ label: "Users" }}
        list={UserList}
        show={UserShow}
        edit={UserEdit}
      />
      <Resource
        name="group_buys"
        options={{ label: "Group Buys" }}
        list={GroupBuyList}
        show={GroupBuyShow}
        edit={GroupBuyEdit}
        create={GroupBuyCreate}
      />
      <Resource name="influencers" list={ListGuesser} />
      <Resource name="feed_posts" list={ListGuesser} />
      <Resource name="raw_posts" list={ListGuesser} />
    </Admin>
  );
}
