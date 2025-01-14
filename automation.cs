        // 如果指定了过滤条件，创建一个组合条件
        if (!string.IsNullOrEmpty(filter))
        {
            searchCondition = new OrCondition(
                new PropertyCondition(AutomationElement.NameProperty, filter, PropertyConditionFlags.IgnoreCase),
                new PropertyCondition(AutomationElement.ClassNameProperty, filter, PropertyConditionFlags.IgnoreCase),
                new PropertyCondition(AutomationElement.AutomationIdProperty, filter, PropertyConditionFlags.IgnoreCase)
            );
        }
