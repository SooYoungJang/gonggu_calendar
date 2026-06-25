import {
  List,
  Datagrid,
  TextField,
  DateField,
  SelectField,
  NumberField,
  Edit,
  SimpleForm,
  TextInput,
  DateInput,
  SelectInput,
  NumberInput,
  Show,
  SimpleShowLayout,
  ShowButton,
  EditButton,
  Create,
  SearchInput,
  FilterButton,
  TopToolbar,
  type EditProps,
} from "react-admin";

const groupBuyFilters = [
  <SearchInput source="productName" alwaysOn key="search" />,
  <SelectInput
    source="status"
    choices={[
      { id: "APPROVED", name: "Approved" },
      { id: "REVIEW_REQUIRED", name: "Review Required" },
      { id: "REJECTED", name: "Rejected" },
      { id: "EXPIRED", name: "Expired" },
    ]}
    key="status"
  />,
];

const ListActions = () => (
  <TopToolbar>
    <FilterButton />
  </TopToolbar>
);

export const GroupBuyList = () => (
  <List
    filters={groupBuyFilters}
    actions={<ListActions />}
    sort={{ field: "createdAt", order: "DESC" }}
    perPage={25}
  >
    <Datagrid rowClick="show">
      <TextField source="productName" label="Product" />
      <TextField source="brandName" label="Brand" />
      <SelectField
        source="status"
        choices={[
          { id: "APPROVED", name: "Approved" },
          { id: "REVIEW_REQUIRED", name: "Review Required" },
          { id: "REJECTED", name: "Rejected" },
          { id: "EXPIRED", name: "Expired" },
        ]}
      />
      <NumberField source="confidence" options={{ minimumFractionDigits: 0, maximumFractionDigits: 2 }} />
      <TextField source="sourceType" label="Source" />
      <DateField source="startDate" label="Start" />
      <DateField source="endDate" label="End" />
      <DateField source="createdAt" label="Created" showTime />
      <ShowButton />
      <EditButton />
    </Datagrid>
  </List>
);

export const GroupBuyShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="productName" label="Product Name" />
      <TextField source="brandName" label="Brand" />
      <TextField source="summary" />
      <TextField source="purchaseUrl" label="Purchase URL" />
      <TextField source="discountInfo" label="Discount Info" />
      <SelectField
        source="status"
        choices={[
          { id: "APPROVED", name: "Approved" },
          { id: "REVIEW_REQUIRED", name: "Review Required" },
          { id: "REJECTED", name: "Rejected" },
          { id: "EXPIRED", name: "Expired" },
        ]}
      />
      <DateField source="startDate" label="Start Date" />
      <DateField source="endDate" label="End Date" />
      <NumberField source="confidence" />
      <TextField source="sourceType" label="Source Type" />
      <TextField source="rejectionReason" label="Rejection Reason" />
      <DateField source="createdAt" label="Created" showTime />
      <DateField source="updatedAt" label="Updated" showTime />
    </SimpleShowLayout>
  </Show>
);

export const GroupBuyEdit = (props: EditProps) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="productName" label="Product Name" fullWidth required />
      <TextInput source="brandName" label="Brand" fullWidth />
      <TextInput source="summary" fullWidth multiline />
      <TextInput source="purchaseUrl" label="Purchase URL" fullWidth />
      <TextInput source="discountInfo" label="Discount Info" fullWidth />
      <DateInput source="startDate" label="Start Date" />
      <DateInput source="endDate" label="End Date" />
      <SelectInput
        source="status"
        choices={[
          { id: "APPROVED", name: "Approved" },
          { id: "REVIEW_REQUIRED", name: "Review Required" },
          { id: "REJECTED", name: "Rejected" },
          { id: "EXPIRED", name: "Expired" },
        ]}
      />
      <TextInput source="rejectionReason" label="Rejection Reason" fullWidth multiline />
    </SimpleForm>
  </Edit>
);

export const GroupBuyCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="productName" label="Product Name" fullWidth required />
      <TextInput source="brandName" label="Brand" fullWidth />
      <TextInput source="summary" fullWidth multiline />
      <TextInput source="purchaseUrl" label="Purchase URL" fullWidth />
      <TextInput source="discountInfo" label="Discount Info" fullWidth />
      <DateInput source="startDate" label="Start Date" />
      <DateInput source="endDate" label="End Date" />
      <SelectInput
        source="status"
        choices={[
          { id: "APPROVED", name: "Approved" },
          { id: "REVIEW_REQUIRED", name: "Review Required" },
          { id: "REJECTED", name: "Rejected" },
          { id: "EXPIRED", name: "Expired" },
        ]}
        defaultValue="APPROVED"
      />
      <NumberInput source="confidence" defaultValue={0.8} />
    </SimpleForm>
  </Create>
);
