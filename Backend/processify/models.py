'''
Created on 02/11/2014

@author: xueguyu
'''

from django.db import models;
from django.contrib.admin.widgets import ForeignKeyRawIdWidget
from django.contrib.auth.models import User

PRIORITY_TYPE_CHOICES = (
    (0, 'Urgent and Important'),
    (1, 'Urgent but not Important'),
    (2, 'Important but not Urgent'),
    (3, 'neither Important nor Urgent'),
)

STATUS = (
    (0, 'Draft'),
    (1, 'Private'), # finished but private
    (2, 'Restricted'), # shared to groups
    (3, 'Public'),  # available in parket
)

class Process(models.Model):
    # Process template
    p_name = models.CharField(max_length = 100)
    p_description = models.TextField()
    p_flow = models.TextField() # a JSON string defining the task flow
    
    p_owner = models.ForeignKey(User)
    p_parent = models.ForeignKey('self', null = True) # parent of the process, default is null
    
    p_status = models.SmallIntegerField(choices = STATUS)
    
class Task(models.Model):
    # Task template
    TASK_TYPE_CHOICES = (
        ('X', 'Execute'),
        ('V', 'Evaluate'),
    )
    
    t_name = models.CharField(max_length = 100)
    t_description = models.TextField()
    t_type = models.CharField(max_length = 1, choices = TASK_TYPE_CHOICES)
    
class Project(models.Model):
    # Instance of process
    j_priority = models.SmallIntegerField(choices = PRIORITY_TYPE_CHOICES)
    
    j_process = models.ForeignKey(Process)
    
    
# define a restricted process share status
# class Restricted_Process_Share(models.Model):
    
    
    
