import {
  List,
  Datagrid,
  TextField,
  DateField,
  Edit,
  SimpleForm,
  TextInput,
  Show,
  SimpleShowLayout,
  ShowButton,
  EditButton,
  SearchInput,
  TopToolbar,
  FilterButton,
  type EditProps,
} from "react-admin";

const userFilters = [
  <SearchInput source="email" alwaysOn key="search" />,
];

const ListActions = () => (
  <TopToolbar>
    <FilterButton />
  </TopToolbar>
);

export const UserList = () => (
  <List
    filters={userFilters}
    actions={<ListActions />}
    sort={{ field: "createdAt", order: "DESC" }}
    perPage={25}
  >
    <Datagrid rowClick="show">
      <TextField source="email" />
      <TextField source="nickname" />
      <DateField source="createdAt" label="Joined" showTime />
      <DateField source="updatedAt" label="Updated" showTime />
      <ShowButton />
      <EditButton />
    </Datagrid>
  </List>
);

export const UserShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" label="User ID" />
      <TextField source="email" />
      <TextField source="nickname" />
      <DateField source="createdAt" label="Joined" showTime />
      <DateField source="updatedAt" label="Updated" showTime />
    </SimpleShowLayout>
  </Show>
);

export const UserEdit = (props: EditProps) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="email" disabled />
      <TextInput source="nickname" />
    </SimpleForm>
  </Edit>
);
