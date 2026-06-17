## Table `profiles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  Nullable |
| `profile_picture` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `role` | `text` |  Nullable |

## Table `subscription_plan`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `plan_id` | `uuid` | Primary |
| `name` | `text` |  |
| `price` | `numeric` |  |
| `file_size_limit` | `int8` |  Nullable |
| `submission_limit` | `int4` |  Nullable |
| `billing_period` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `user_subscription`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `user_subscription_id` | `uuid` | Primary |
| `profile_id` | `uuid` |  |
| `plan_id` | `uuid` |  |
| `start_date` | `date` |  |
| `end_date` | `date` |  Nullable |
| `status` | `text` |  |

## Table `rubric`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `rubric_id` | `uuid` | Primary |
| `creator_profile_id` | `uuid` |  |
| `rubric_name` | `text` |  |
| `rubric_description` | `text` |  Nullable |
| `rubric_create_time` | `timestamptz` |  |
| `rubric_last_edit` | `timestamptz` |  |
| `max_score` | `numeric` |  Nullable |

## Table `rubric_criteria`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `criteria_id` | `uuid` | Primary |
| `rubric_id` | `uuid` |  |
| `name` | `text` |  |
| `description` | `text` |  Nullable |
| `weight` | `numeric` |  Nullable |
| `max_score` | `numeric` |  Nullable |
| `display_order` | `int4` |  |

## Table `submission`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `submission_id` | `uuid` | Primary |
| `profile_id` | `uuid` |  |
| `submission_time` | `timestamptz` |  |
| `status` | `text` |  |
| `submission_title` | `text` |  Nullable |

## Table `submission_file`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `file_id` | `uuid` | Primary |
| `submission_id` | `uuid` |  |
| `file_name` | `text` |  |
| `file_type` | `text` |  Nullable |
| `upload_time` | `timestamptz` |  |
| `path` | `text` |  |

## Table `grade_result`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `grade_result_id` | `uuid` | Primary |
| `rubric_id` | `uuid` |  |
| `submission_id` | `uuid` |  |
| `overall_score` | `numeric` |  Nullable |
| `feedback` | `text` |  Nullable |
| `created_time` | `timestamptz` |  |
| `raw_grading_result` | `jsonb` |  Nullable |

## Table `criterion_result`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `result_id` | `uuid` | Primary |
| `criteria_id` | `uuid` |  |
| `grade_result_id` | `uuid` |  |
| `score` | `numeric` |  Nullable |
| `feedback` | `text` |  Nullable |

## Table `orders`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `profile_id` | `uuid` |  Nullable |
| `amount` | `numeric` |  |
| `status` | `text` |  |
| `created_at` | `timestamptz` |  Nullable |

## Table `payments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `order_id` | `uuid` |  Nullable |
| `provider` | `text` |  |
| `provider_payment_id` | `text` |  Nullable |
| `amount` | `numeric` |  |
| `currency` | `text` |  Nullable |
| `status` | `text` |  |
| `created_at` | `timestamptz` |  Nullable |
| `completed_at` | `timestamptz` |  Nullable |

## Table `class`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `class_id` | `uuid` | Primary |
| `teacher_profile_id` | `uuid` |  |
| `class_name` | `text` |  |
| `class_code` | `text` |  Nullable |
| `description` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `student`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `student_id` | `uuid` | Primary |
| `student_code` | `text` |  |
| `full_name` | `text` |  |
| `email` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `class_student`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `class_student_id` | `uuid` | Primary |
| `class_id` | `uuid` |  |
| `student_id` | `uuid` |  |
| `joined_at` | `timestamptz` |  |

## Table `exam`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `exam_id` | `uuid` | Primary |
| `class_id` | `uuid` |  |
| `exam_name` | `text` |  |
| `description` | `text` |  Nullable |
| `max_score` | `numeric` |  |
| `exam_date` | `timestamptz` |  Nullable |
| `created_by` | `uuid` |  |
| `created_at` | `timestamptz` |  |

## Table `exam_result`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `exam_result_id` | `uuid` | Primary |
| `exam_id` | `uuid` |  |
| `student_id` | `uuid` |  |
| `score` | `numeric` |  Nullable |
| `feedback` | `text` |  Nullable |
| `graded_at` | `timestamptz` |  |

## Table `exam_type`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `exam_type_id` | `uuid` | Primary |
| `name` | `text` |  Unique |

## Table `student_import`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `import_id` | `uuid` | Primary |
| `class_id` | `uuid` |  |
| `imported_by` | `uuid` |  |
| `file_name` | `text` |  Nullable |
| `total_students` | `int4` |  Nullable |
| `imported_at` | `timestamptz` |  |

