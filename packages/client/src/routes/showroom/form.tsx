import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import * as z from 'zod';

import { useAppForm } from '@/components/form';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Field, FieldGroup } from '@/components/ui/field';

const formSchema = z.object({
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters.')
        .max(10, 'Username must be at most 10 characters.')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores.'),
    age: z.number('Age must be a number.').min(18, 'You must be at least 18 years old.'),
    language: z.string('Language must be a string.').min(1, 'Language must be selected.'),
    test: z.string('Test must be a string.').min(1, 'Test must be selected.'),
    twoFactor: z.boolean('Two Factor Authentication must be a boolean.'),
    tasks: z.array(z.string()).min(1, 'At least one task must be selected.'),
});

export const Route = createFileRoute('/showroom/form')({
    component: RouteComponent,
});

function RouteComponent() {
    const { form, Input, Form, Select, SubmitButton, Textarea, Switch, Checkbox, RadioGroup } =
        useAppForm({
            schema: formSchema,
            defaultValues: {
                language: '',
                username: 'test',
                age: 3,
                twoFactor: false,
                test: 'test',
                tasks: [],
            },
            onSubmit: async ({ value }) => {
                alert('You submitted the following values:' + JSON.stringify(value, null, 2));
                console.log('You submitted the following values:', value);
            },
        });

    return (
        <div className="p-10 space-y-10">
            <Card className="w-full sm:max-w-md">
                <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>Update your profile information below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form>
                        <FieldGroup>
                            <Input name="username" label="Username" />
                            <Input name="age" label="Age" />
                            <Select
                                name="language"
                                label="Language"
                                options={[
                                    { value: 'auto', label: 'Auto' },
                                    { value: 'en', label: 'English' },
                                    { value: 'es', label: 'Spanish' },
                                    { value: 'fr', label: 'French' },
                                    { value: 'de', label: 'German' },
                                    { value: 'it', label: 'Italian' },
                                    { value: 'pt', label: 'Portuguese' },
                                    { value: 'ru', label: 'Russian' },
                                    { value: 'zh', label: 'Chinese' },
                                ]}
                                description="For best results, select the language you speak."
                            />
                            <Textarea name="test" label="About" />
                            <Switch
                                name="twoFactor"
                                description="Enable two factor authentication."
                                label="Two Factor Authentication"
                            />
                            <Checkbox
                                name="tasks"
                                description="Select the tasks you want to complete."
                                label="Tasks"
                                options={[
                                    {
                                        id: 'task1',
                                        label: 'Task 1',
                                        description: 'Task 1 description',
                                    },
                                    {
                                        id: 'task2',
                                        label: 'Task 2',
                                        description: 'Task 2 description',
                                    },
                                    {
                                        id: 'task3',
                                        label: 'Task 3',
                                    },
                                ]}
                            />
                            <RadioGroup
                                name="test"
                                description="Select the test you want to complete."
                                label="Test"
                                options={[
                                    {
                                        id: 'test1',
                                        label: 'Test 1',
                                        description: 'Test 1 description',
                                    },
                                    {
                                        id: 'test2',
                                        label: 'Test 2',
                                        description: 'Test 2 description',
                                    },
                                ]}
                            />
                        </FieldGroup>
                    </Form>
                </CardContent>
                <CardFooter>
                    <Field orientation="horizontal">
                        <Button type="button" variant="outline" onClick={() => form.reset()}>
                            Reset
                        </Button>
                        <SubmitButton>Save</SubmitButton>
                    </Field>
                </CardFooter>
            </Card>
        </div>
    );
}
