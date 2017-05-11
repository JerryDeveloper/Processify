'''
Created on 08/Nov/2014

@author: xueguyu
'''

from django import forms

class LogInForm(forms.Form):
    username = forms.CharField(label="User name", max_length=100)
    password = forms.CharField(label="Password", widget=forms.PasswordInput, max_length=100)
    
class SignUpForm(forms.Form):
    email = forms.EmailField(label="Email", max_length=100)
    password = forms.CharField(label="Password", widget=forms.PasswordInput, max_length=100)
    re_password = forms.CharField(label="Re-enter Password", widget=forms.PasswordInput, max_length=100)
    
class TaskDetailForm(forms.Form):
    name = forms.CharField(label="Task name", max_length=1000)
    description = forms.CharField(label="Description", widget=forms.Textarea)