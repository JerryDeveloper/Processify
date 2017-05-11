'''
Created on 08/Nov/2014

@author: xueguyu
'''

from django.http import HttpResponse

from django.shortcuts import render_to_response
from django.http.response import HttpResponseRedirect
from django.template import RequestContext

from django.contrib import auth
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required

from django.core.exceptions import ObjectDoesNotExist
from django.core.urlresolvers import reverse

from processify import forms

# TODO : email verification
def signup(request):
    # logged in already
    if(request.user.is_authenticated()):
        return HttpResponseRedirect(reverse('task'))
    
    # didn't log in
    if request.method == 'POST':
        signup_form = forms.SignUpForm(request.POST)
        
        if(signup_form.is_valid()):
            email = signup_form.cleaned_data['email']
            password = signup_form.cleaned_data['password']
            re_password = signup_form.cleaned_data['re_password']
            
            if(password == re_password):
                try:
                    user = User.objects.get(username = email)
                except ObjectDoesNotExist:
                    user = User.objects.create_user(username = email, email = email, password = password)
                    return HttpResponseRedirect("/congrat/")

                error_msg = 'Email exists already'
            else:
                error_msg = 'Two passwords are different'
        else:
            error_msg = 'Invalid input'
        
        context = RequestContext(request, {"signup_form" : signup_form, "error_msg" : error_msg})
        return render_to_response("processify/account_signup.html", context)
    else:
        signup_form = forms.SignUpForm()
        
        context = RequestContext(request, {"signup_form" : signup_form})
        return render_to_response("processify/account_signup.html", context)

def login(request):
    # logged in already
    if(request.user.is_authenticated()):
        return HttpResponseRedirect(reverse('task'))
    
    # didn't log in
    
    if request.method == 'POST':
        login_form = forms.LogInForm(request.POST)
        
        if(login_form.is_valid()):
            username = login_form.cleaned_data['username']
            password = login_form.cleaned_data['password']
            user = auth.authenticate(username=username, password=password)
            
            if user is not None: 
                if user.is_active:
                    auth.login(request, user)
                    return HttpResponseRedirect("/task/")
                else:
                    error_msg = 'User is not active'
            else:
                error_msg = 'Fail to login'
        else:
            error_msg = 'Invalid inputs'
        
        context = RequestContext(request, {'login_form': login_form,
                                            'error_msg': error_msg})
        return render_to_response('processify/account_login.html', context)
    else:
        login_form = forms.LogInForm()
        context = RequestContext(request, {'login_form': login_form})
        return render_to_response('processify/account_login.html', context)
        
@login_required(login_url='/login/')  
def mytask(request):
    username = request.user.username;
    context = RequestContext(request, {'username': username})
    return render_to_response('processify/task_main.html', context)

@login_required(login_url='/login/')
def manageProcess(request):
    username = request.user.username;
    context = RequestContext(request, {'username': username})
    return render_to_response('processify/process_main.html', context)

@login_required(login_url='/login/')
def manageProject(request):
    username = request.user.username;
    context = RequestContext(request, {'username': username})
    return render_to_response('processify/project_main.html', context)

@login_required(login_url='/login/')
def parket(request):
    username = request.user.username;
    context = RequestContext(request, {'username': username})
    return render_to_response('processify/parket_main.html', context)

@login_required(login_url='/login/')
def pcanvas(request):
    username = request.user.username;
    task_detail_form = forms.TaskDetailForm()
    context = RequestContext(request, {'username': username,
                                       'task_detail_form': task_detail_form})
    return render_to_response('processify/process_canvas.html', context)
