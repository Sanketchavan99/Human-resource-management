import React, { useState, useMemo } from 'react';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    User,
    Chip,
    Tooltip,
    Input,
    Button,
    Pagination,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem
} from '@heroui/react';
import { Icon } from '@iconify/react';

const columns = [
    { name: "NAME", uid: "name" },
    { name: "ROLE", uid: "role" },
    { name: "STATUS", uid: "status" },
    { name: "CONTACT", uid: "contact" },
    { name: "JOINED", uid: "joined" },
    { name: "ACTIONS", uid: "actions" },
];

const statusColorMap = {
    verified: "success",
    pending: "warning",
};

const UserManagementTable = ({ users, onDelete, onView, loading }) => {
    const [filterValue, setFilterValue] = useState("");
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

    const hasSearchFilter = Boolean(filterValue);

    const filteredItems = useMemo(() => {
        let filteredUsers = [...users];

        if (hasSearchFilter) {
            filteredUsers = filteredUsers.filter((user) =>
                user.name?.toLowerCase().includes(filterValue.toLowerCase()) ||
                user.email?.toLowerCase().includes(filterValue.toLowerCase()) ||
                user.empCode?.toLowerCase().includes(filterValue.toLowerCase())
            );
        }

        return filteredUsers;
    }, [users, filterValue]);

    const pages = Math.ceil(filteredItems.length / rowsPerPage);

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return filteredItems.slice(start, end);
    }, [page, filteredItems]);

    const renderCell = React.useCallback((user, columnKey) => {
        const cellValue = user[columnKey];

        switch (columnKey) {
            case "name":
                return (
                    <User
                        avatarProps={{ radius: "lg", src: user.avatar }}
                        description={user.empCode || 'No Code'}
                        name={cellValue}
                    >
                        {user.email}
                    </User>
                );
            case "role":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm capitalize">{cellValue}</p>
                        <p className="text-bold text-tiny capitalize text-default-400">{user.designation || 'N/A'}</p>
                    </div>
                );
            case "status":
                // Assuming status logic based on profile completion or explicit status field
                const status = user.isPhoneVerified ? 'verified' : 'pending';
                return (
                    <Chip className="capitalize" color={statusColorMap[status]} size="sm" variant="flat">
                        {status}
                    </Chip>
                );
            case "contact":
                return (
                    <div className="flex flex-col">
                        <p className="text-sm">{user.phoneNumber}</p>
                        <p className="text-tiny text-default-400">{user.empCode}</p>
                    </div>
                );
            case "joined":
                return (
                    <p className="text-sm">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2">
                        <Tooltip content="View Profile">
                            <span
                                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                                onClick={() => onView && onView(user)}
                            >
                                <Icon icon="lucide:eye" />
                            </span>
                        </Tooltip>
                        <Tooltip color="danger" content="Delete user">
                            <span
                                className="text-lg text-danger cursor-pointer active:opacity-50"
                                onClick={() => onDelete && onDelete(user.id)}
                            >
                                <Icon icon="lucide:trash-2" />
                            </span>
                        </Tooltip>
                    </div>
                );
            default:
                return cellValue;
        }
    }, [onDelete, onView]);

    const onSearchChange = React.useCallback((value) => {
        if (value) {
            setFilterValue(value);
            setPage(1);
        } else {
            setFilterValue("");
        }
    }, []);

    const onClear = React.useCallback(() => {
        setFilterValue("")
        setPage(1)
    }, [])

    const topContent = useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-3 items-end">
                    <Input
                        isClearable
                        className="w-full sm:max-w-[44%]"
                        placeholder="Search by name, email, or code..."
                        startContent={<Icon icon="lucide:search" />}
                        value={filterValue}
                        onClear={() => onClear()}
                        onValueChange={onSearchChange}
                    />
                    <div className="flex gap-3">
                        <Button color="primary" endContent={<Icon icon="lucide:plus" />}>
                            Add New
                        </Button>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-small">Total {users.length} users</span>
                </div>
            </div>
        );
    }, [filterValue, onSearchChange, users.length, onClear]);

    const bottomContent = useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-center items-center">
                <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={pages}
                    onChange={setPage}
                />
            </div>
        );
    }, [page, pages]);

    return (
        <Table
            aria-label="User management table"
            isHeaderSticky
            bottomContent={bottomContent}
            classNames={{
                wrapper: "max-h-[600px]",
            }}
            topContent={topContent}
        >
            <TableHeader columns={columns}>
                {(column) => (
                    <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                        {column.name}
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody
                emptyContent={"No users found"}
                items={items}
                isLoading={loading}
                loadingContent={<div className="h-full w-full flex items-center justify-center">Loading...</div>}
            >
                {(item) => (
                    <TableRow key={item.id || item._id || Math.random()}>
                        {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
};

export default UserManagementTable;
